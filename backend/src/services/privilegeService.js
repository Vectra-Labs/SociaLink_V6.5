/**
 * Privilege Service
 * Centralized service for managing user privileges with caching
 * 
 * This service reads from SystemSetting table and provides
 * privilege rules for Workers, Establishments, and Admins
 */

import { prisma } from '../config/db.js';

// Cache for privilege settings (5 minutes TTL)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Default privilege values (used if not in DB)
const DEFAULT_PRIVILEGES = {
    // ============ WORKER PRIVILEGES ============
    worker_free_missions_limit: 4,
    worker_visibility_delay_hours: 48,
    worker_free_applications_limit: 3,
    worker_urgent_access_premium_only: true,
    worker_monetization_mode: 'SUBSCRIPTION', // SUBSCRIPTION | CREDITS | COMMISSION
    worker_credits_per_application: 1,
    worker_mission_commission_rate: 5.0,
    worker_completed_missions_homepage: 3,

    // ============ ESTABLISHMENT PRIVILEGES ============
    estab_free_missions_limit: 3,
    estab_free_applications_limit: 20,
    estab_urgent_free_allowed: false,
    estab_monetization_mode: 'SUBSCRIPTION', // SUBSCRIPTION | CREDITS | COMMISSION
    estab_credits_per_mission: 1,
    estab_credits_urgent_mission: 3,
    estab_recruitment_commission: 10.0,

    // ============ ADMIN PRIVILEGES ============
    admin_daily_validation_quota: 0, // 0 = unlimited
    admin_can_edit_finances: false,

    // ============ GLOBAL SETTINGS ============
    review_period_days: 7,
    urgent_missions_enabled: true,
};

/**
 * Parse value from string to appropriate type
 */
function parseValue(value, expectedType = null) {
    if (value === null || value === undefined) return value;

    // Boolean
    if (value === 'true') return true;
    if (value === 'false') return false;

    // Number
    const num = Number(value);
    if (!isNaN(num) && value.trim() !== '') return num;

    // String
    return value;
}

/**
 * Get all privileges for a category (WORKER, ESTABLISHMENT, ADMIN, GLOBAL)
 * Uses cache to avoid repeated DB queries
 */
export async function getPrivileges(category = null) {
    const cacheKey = `privileges_${category || 'ALL'}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }

    try {
        const whereClause = category
            ? { category: category.toUpperCase() }
            : {};

        const settings = await prisma.systemSetting.findMany({
            where: whereClause
        });

        // Merge with defaults
        const result = { ...DEFAULT_PRIVILEGES };

        settings.forEach(setting => {
            result[setting.key] = parseValue(setting.value);
        });

        // Only return category-specific if requested
        if (category) {
            const prefix = category.toLowerCase().replace('establishment', 'estab');
            const filtered = {};
            Object.entries(result).forEach(([key, value]) => {
                if (key.startsWith(prefix) || key.startsWith('worker') && category === 'WORKER') {
                    filtered[key] = value;
                }
            });
            cache.set(cacheKey, { data: filtered, timestamp: Date.now() });
            return filtered;
        }

        cache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
    } catch (error) {
        console.error('Error fetching privileges:', error);
        return DEFAULT_PRIVILEGES;
    }
}

/**
 * Get a single privilege value
 */
export async function getPrivilege(key) {
    const privileges = await getPrivileges();
    return privileges[key] ?? DEFAULT_PRIVILEGES[key];
}

/**
 * Update a privilege setting
 * Only SuperAdmin should call this
 */
export async function setPrivilege(key, value, category = 'GLOBAL', updatedBy = null) {
    try {
        await prisma.systemSetting.upsert({
            where: { key },
            update: {
                value: String(value),
                category,
            },
            create: {
                key,
                value: String(value),
                category,
                description: `Privilege setting: ${key}`
            }
        });

        // Invalidate cache
        invalidateCache();

        return true;
    } catch (error) {
        console.error('Error setting privilege:', error);
        throw error;
    }
}

/**
 * Bulk update privileges
 */
export async function setPrivileges(updates, category = 'GLOBAL') {
    const operations = Object.entries(updates).map(([key, value]) => {
        return prisma.systemSetting.upsert({
            where: { key },
            update: {
                value: String(value),
                category,
            },
            create: {
                key,
                value: String(value),
                category,
                description: `Privilege setting: ${key}`
            }
        });
    });

    try {
        await prisma.$transaction(operations);
        invalidateCache();
        return true;
    } catch (error) {
        console.error('Error bulk setting privileges:', error);
        throw error;
    }
}

/**
 * Invalidate all cached privileges
 */
export function invalidateCache() {
    cache.clear();
}

/**
 * Get worker access level based on user status
 */
export async function getWorkerAccessLevel(user, subscription = null) {
    if (!user) return 'VISITOR';
    if (user.role !== 'WORKER') return 'OTHER';
    if (user.status !== 'VALIDATED') return 'PENDING';

    // Check subscription
    const isPremium = subscription?.status === 'ACTIVE' &&
        subscription?.plan?.code !== 'BASIC';

    return isPremium ? 'PREMIUM' : 'VALIDATED';
}

/**
 * Get establishment access level
 */
export async function getEstablishmentAccessLevel(user, subscription = null) {
    if (!user) return 'VISITOR';
    if (user.role !== 'ESTABLISHMENT') return 'OTHER';
    if (user.status !== 'VALIDATED') return 'PENDING';

    const isPremium = subscription?.status === 'ACTIVE' &&
        subscription?.plan?.code !== 'BASIC';

    return isPremium ? 'PREMIUM' : 'VERIFIED';
}

/**
 * Check if mission should be redacted for a worker
 */
export async function shouldRedactMission(mission, accessLevel, privileges) {
    if (accessLevel === 'VISITOR' || accessLevel === 'PENDING') {
        return { redact: true, reason: accessLevel };
    }

    if (accessLevel === 'PREMIUM' || accessLevel === 'OTHER') {
        return { redact: false };
    }

    // VALIDATED worker (non-premium)
    const priv = privileges || await getPrivileges('WORKER');

    // Check urgent
    if (mission.is_urgent && priv.worker_urgent_access_premium_only) {
        return { redact: true, reason: 'URGENT_PREMIUM_ONLY' };
    }

    // Check 48h rule
    const createdAt = new Date(mission.created_at);
    const now = new Date();
    const hoursDiff = (now - createdAt) / (1000 * 60 * 60);

    if (hoursDiff < priv.worker_visibility_delay_hours) {
        return { redact: true, reason: 'RECENT_MISSION_PREMIUM_ONLY' };
    }

    return { redact: false };
}

export default {
    getPrivileges,
    getPrivilege,
    setPrivilege,
    setPrivileges,
    invalidateCache,
    getWorkerAccessLevel,
    getEstablishmentAccessLevel,
    shouldRedactMission,
    DEFAULT_PRIVILEGES
};
