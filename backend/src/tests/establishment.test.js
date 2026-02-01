/**
 * Establishment API Tests
 * Tests for establishment-specific endpoints: profile, stats
 */

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { testUsers, loginAs } from './helpers.js';

describe('Establishment API', () => {
    let establishmentToken;
    let workerToken;

    beforeAll(async () => {
        const estabLogin = await loginAs(request, app, testUsers.establishmentPro);
        establishmentToken = estabLogin.cookies;

        const workerLogin = await loginAs(request, app, testUsers.workerPremium);
        workerToken = workerLogin.cookies;
    });

    // ===================== PROFILE TESTS =====================
    describe('GET /api/establishment/profile', () => {

        it('should get profile for authenticated establishment', async () => {
            const response = await request(app)
                .get('/api/establishment/profile')
                .set('Cookie', establishmentToken);

            expect(response.status).toBe(200);
            expect(response.body).toBeDefined();
        });

        it('should reject access for non-establishment role', async () => {
            const response = await request(app)
                .get('/api/establishment/profile')
                .set('Cookie', workerToken);

            expect([403, 401]).toContain(response.status);
        });

        it('should reject unauthenticated access', async () => {
            const response = await request(app)
                .get('/api/establishment/profile');

            expect(response.status).toBe(401);
        });
    });

    // ===================== STATS TESTS =====================
    describe('GET /api/establishment/stats', () => {

        it('should get stats for authenticated establishment', async () => {
            const response = await request(app)
                .get('/api/establishment/stats')
                .set('Cookie', establishmentToken);

            expect(response.status).toBe(200);
        });
    });
});
