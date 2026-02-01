/**
 * Privilege Controller
 * API endpoints for managing privileges (SuperAdmin only)
 */

import privilegeService from '../services/privilegeService.js';
import { prisma } from '../config/db.js';

/**
 * GET /api/privileges
 * Get all privileges or by category
 */
export const getAllPrivileges = async (req, res) => {
    try {
        const { category } = req.query;
        const privileges = await privilegeService.getPrivileges(category);

        res.status(200).json({
            status: 'success',
            data: privileges,
            defaults: privilegeService.DEFAULT_PRIVILEGES
        });
    } catch (error) {
        console.error('Get privileges error:', error);
        res.status(500).json({ message: 'Failed to fetch privileges' });
    }
};

/**
 * GET /api/privileges/:key
 * Get a single privilege value
 */
export const getPrivilege = async (req, res) => {
    try {
        const { key } = req.params;
        const value = await privilegeService.getPrivilege(key);

        res.status(200).json({
            status: 'success',
            data: { key, value }
        });
    } catch (error) {
        console.error('Get privilege error:', error);
        res.status(500).json({ message: 'Failed to fetch privilege' });
    }
};

/**
 * PUT /api/privileges
 * Bulk update privileges (SuperAdmin only)
 */
export const updatePrivileges = async (req, res) => {
    try {
        const { updates, category = 'GLOBAL' } = req.body;

        if (!updates || typeof updates !== 'object') {
            return res.status(400).json({ message: 'Updates object is required' });
        }

        await privilegeService.setPrivileges(updates, category);

        // Log the action
        await prisma.adminLog.create({
            data: {
                admin_id: req.user.user_id,
                action: 'UPDATE_PRIVILEGES',
                target_type: 'SYSTEM',
                target_id: category,
                details: updates,
                ip_address: req.ip
            }
        });

        res.status(200).json({
            status: 'success',
            message: 'Privileges updated successfully'
        });
    } catch (error) {
        console.error('Update privileges error:', error);
        res.status(500).json({ message: 'Failed to update privileges' });
    }
};

/**
 * PUT /api/privileges/:key
 * Update a single privilege (SuperAdmin only)
 */
export const updatePrivilege = async (req, res) => {
    try {
        const { key } = req.params;
        const { value, category = 'GLOBAL' } = req.body;

        if (value === undefined) {
            return res.status(400).json({ message: 'Value is required' });
        }

        await privilegeService.setPrivilege(key, value, category, req.user.user_id);

        // Log the action
        await prisma.adminLog.create({
            data: {
                admin_id: req.user.user_id,
                action: 'UPDATE_PRIVILEGE',
                target_type: 'SYSTEM',
                target_id: key,
                details: { key, value, category },
                ip_address: req.ip
            }
        });

        res.status(200).json({
            status: 'success',
            message: `Privilege ${key} updated successfully`
        });
    } catch (error) {
        console.error('Update privilege error:', error);
        res.status(500).json({ message: 'Failed to update privilege' });
    }
};

/**
 * POST /api/privileges/invalidate-cache
 * Force cache refresh (SuperAdmin only)
 */
export const invalidateCache = async (req, res) => {
    try {
        privilegeService.invalidateCache();

        res.status(200).json({
            status: 'success',
            message: 'Privilege cache invalidated'
        });
    } catch (error) {
        console.error('Invalidate cache error:', error);
        res.status(500).json({ message: 'Failed to invalidate cache' });
    }
};

/**
 * GET /api/privileges/worker-access
 * Get worker access level and applicable privileges for current user
 */
export const getWorkerAccess = async (req, res) => {
    try {
        const user = req.user;

        // Get subscription if worker
        let subscription = null;
        if (user?.role === 'WORKER') {
            subscription = await prisma.subscription.findUnique({
                where: { user_id: user.user_id },
                include: { plan: true }
            });
        }

        const accessLevel = await privilegeService.getWorkerAccessLevel(user, subscription);
        const privileges = await privilegeService.getPrivileges('WORKER');

        res.status(200).json({
            status: 'success',
            data: {
                accessLevel,
                privileges,
                isPremium: accessLevel === 'PREMIUM'
            }
        });
    } catch (error) {
        console.error('Get worker access error:', error);
        res.status(500).json({ message: 'Failed to fetch worker access' });
    }
};
