/**
 * Worker API Tests
 * Tests for worker-specific endpoints: profile, calendar, documents
 */

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { testUsers, loginAs } from './helpers.js';

describe('Worker API', () => {
    let workerToken;
    let establishmentToken;

    beforeAll(async () => {
        // Login as different roles
        const workerLogin = await loginAs(request, app, testUsers.workerPremium);
        workerToken = workerLogin.cookies;

        // Login as establishment to test access control
        const estabLogin = await loginAs(request, app, testUsers.establishmentPro);
        establishmentToken = estabLogin.cookies;
    });

    // ===================== PROFILE TESTS =====================
    describe('GET /api/worker/profile', () => {

        it('should get profile for authenticated worker', async () => {
            const response = await request(app)
                .get('/api/worker/profile')
                .set('Cookie', workerToken);

            expect(response.status).toBe(200);
            // Response contains data object
            expect(response.body.data).toBeDefined();
        });

        it('should reject access for non-worker role', async () => {
            const response = await request(app)
                .get('/api/worker/profile')
                .set('Cookie', establishmentToken);

            // Should be forbidden for non-workers
            expect([403, 401, 404]).toContain(response.status);
        });

        it('should reject unauthenticated access', async () => {
            const response = await request(app)
                .get('/api/worker/profile');

            expect(response.status).toBe(401);
        });
    });

    // ===================== STATS TESTS =====================
    describe('GET /api/worker/stats', () => {

        it('should get stats for authenticated worker', async () => {
            const response = await request(app)
                .get('/api/worker/stats')
                .set('Cookie', workerToken);

            expect(response.status).toBe(200);
            expect(response.body.data).toBeDefined();
        });
    });
});
