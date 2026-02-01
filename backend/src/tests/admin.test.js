/**
 * Admin API Tests
 * Tests for admin and super-admin endpoints: user management, validation
 */

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { testUsers, loginAs } from './helpers.js';

describe('Admin API', () => {
    let adminToken;
    let workerToken;

    beforeAll(async () => {
        const adminLogin = await loginAs(request, app, testUsers.admin);
        adminToken = adminLogin.cookies;

        const workerLogin = await loginAs(request, app, testUsers.workerPremium);
        workerToken = workerLogin.cookies;
    });

    // ===================== ADMIN NOTIFICATIONS TESTS =====================
    describe('GET /api/admin/notifications', () => {

        it('should get notifications for admin', async () => {
            const response = await request(app)
                .get('/api/admin/notifications')
                .set('Cookie', adminToken);

            expect(response.status).toBe(200);
        });

        it('should reject access for non-admin role', async () => {
            const response = await request(app)
                .get('/api/admin/notifications')
                .set('Cookie', workerToken);

            expect([403, 401]).toContain(response.status);
        });
    });

    // ===================== PENDING DOCUMENTS TESTS =====================
    describe('GET /api/admin/documents/pending', () => {

        it('should get pending documents for admin', async () => {
            const response = await request(app)
                .get('/api/admin/documents/pending')
                .set('Cookie', adminToken);

            expect(response.status).toBe(200);
        });
    });
});

describe('Super Admin API', () => {
    let superAdminToken;
    let adminToken;
    let workerToken;

    beforeAll(async () => {
        const superAdminLogin = await loginAs(request, app, testUsers.superAdmin);
        superAdminToken = superAdminLogin.cookies;

        const adminLogin = await loginAs(request, app, testUsers.admin);
        adminToken = adminLogin.cookies;

        const workerLogin = await loginAs(request, app, testUsers.workerPremium);
        workerToken = workerLogin.cookies;
    });

    // ===================== SUPER ADMIN STATS TESTS =====================
    describe('GET /api/super-admin/stats', () => {

        it('should get stats for super admin', async () => {
            const response = await request(app)
                .get('/api/super-admin/stats')
                .set('Cookie', superAdminToken);

            expect(response.status).toBe(200);
        });

        it('should allow admin access to stats (shared route)', async () => {
            const response = await request(app)
                .get('/api/super-admin/stats')
                .set('Cookie', adminToken);

            // Stats are shared with ADMIN role
            expect(response.status).toBe(200);
        });

        it('should reject access for worker', async () => {
            const response = await request(app)
                .get('/api/super-admin/stats')
                .set('Cookie', workerToken);

            expect([403, 401]).toContain(response.status);
        });
    });

    // ===================== SETTINGS TESTS (SUPER ADMIN ONLY) =====================
    describe('GET /api/super-admin/settings', () => {

        it('should get settings for super admin', async () => {
            const response = await request(app)
                .get('/api/super-admin/settings')
                .set('Cookie', superAdminToken);

            expect(response.status).toBe(200);
        });

        it('should reject admin access to settings', async () => {
            const response = await request(app)
                .get('/api/super-admin/settings')
                .set('Cookie', adminToken);

            // Settings are SUPER_ADMIN only
            expect([403, 401]).toContain(response.status);
        });
    });

    // ===================== USERS TESTS (SHARED) =====================
    describe('GET /api/super-admin/users', () => {

        it('should get all users for super admin', async () => {
            const response = await request(app)
                .get('/api/super-admin/users')
                .set('Cookie', superAdminToken);

            expect(response.status).toBe(200);
        });
    });

    // ===================== PLANS TESTS (SUPER ADMIN ONLY) =====================
    describe('GET /api/super-admin/plans', () => {

        it('should get subscription plans for super admin', async () => {
            const response = await request(app)
                .get('/api/super-admin/plans')
                .set('Cookie', superAdminToken);

            expect(response.status).toBe(200);
        });

        it('should reject admin access to plans', async () => {
            const response = await request(app)
                .get('/api/super-admin/plans')
                .set('Cookie', adminToken);

            // Plans are SUPER_ADMIN only
            expect([403, 401]).toContain(response.status);
        });
    });
});
