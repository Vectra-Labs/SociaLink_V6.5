/**
 * Mission API Tests
 * Tests for mission endpoints: list, create, update, applications
 */

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { testUsers, loginAs } from './helpers.js';

describe('Mission API', () => {
    let workerToken;
    let establishmentToken;

    beforeAll(async () => {
        const workerLogin = await loginAs(request, app, testUsers.workerPremium);
        workerToken = workerLogin.cookies;

        const estabLogin = await loginAs(request, app, testUsers.establishmentPro);
        establishmentToken = estabLogin.cookies;
    });

    // ===================== GET MISSIONS TESTS =====================
    describe('GET /api/missions', () => {

        it('should list missions for authenticated worker', async () => {
            const response = await request(app)
                .get('/api/missions')
                .set('Cookie', workerToken);

            expect(response.status).toBe(200);
            // Response should contain missions array or data object
            expect(response.body).toBeDefined();
        });

        it('should list missions for authenticated establishment', async () => {
            const response = await request(app)
                .get('/api/missions')
                .set('Cookie', establishmentToken);

            expect(response.status).toBe(200);
        });

        it('should reject unauthenticated access', async () => {
            const response = await request(app)
                .get('/api/missions');

            expect(response.status).toBe(401);
        });
    });
});

describe('Application API', () => {
    let workerToken;
    let establishmentToken;

    beforeAll(async () => {
        const workerLogin = await loginAs(request, app, testUsers.workerPremium);
        workerToken = workerLogin.cookies;

        const estabLogin = await loginAs(request, app, testUsers.establishmentPro);
        establishmentToken = estabLogin.cookies;
    });

    // ===================== APPLICATIONS TESTS =====================
    describe('GET /api/applications', () => {

        it('should list applications for worker', async () => {
            const response = await request(app)
                .get('/api/applications')
                .set('Cookie', workerToken);

            expect(response.status).toBe(200);
        });

        it('should list applications for establishment', async () => {
            const response = await request(app)
                .get('/api/applications')
                .set('Cookie', establishmentToken);

            expect(response.status).toBe(200);
        });
    });
});
