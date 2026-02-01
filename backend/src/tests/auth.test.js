/**
 * Auth API Tests
 * Tests for authentication endpoints: login, register, logout, password reset
 */

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { testUsers, loginAs } from './helpers.js';

describe('Auth API', () => {

    // ===================== LOGIN TESTS =====================
    describe('POST /api/auth/login', () => {

        it('should login successfully with valid SuperAdmin credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send(testUsers.superAdmin);

            expect(response.status).toBe(200);
            expect(response.body.user).toBeDefined();
            expect(response.body.user.role).toBe('SUPER_ADMIN');
        });

        it('should login successfully with valid Admin credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send(testUsers.admin);

            expect(response.status).toBe(200);
            expect(response.body.user).toBeDefined();
            expect(response.body.user.role).toBe('ADMIN');
        });

        it('should login successfully with valid Worker credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send(testUsers.workerPremium);

            expect(response.status).toBe(200);
            expect(response.body.user).toBeDefined();
            expect(response.body.user.role).toBe('WORKER');
        });

        it('should login successfully with valid Establishment credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send(testUsers.establishmentPro);

            expect(response.status).toBe(200);
            expect(response.body.user).toBeDefined();
            expect(response.body.user.role).toBe('ESTABLISHMENT');
        });

        it('should reject login with wrong password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUsers.superAdmin.email,
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
        });

        it('should reject login with non-existent email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@test.ma',
                    password: 'test123'
                });

            expect(response.status).toBe(401);
        });

        it('should reject login with invalid email format', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'invalid-email',
                    password: 'test123'
                });

            expect(response.status).toBe(400);
        });

        it('should reject login with missing password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUsers.superAdmin.email
                });

            expect(response.status).toBe(400);
        });
    });

    // ===================== LOGOUT TESTS =====================
    describe('POST /api/auth/logout', () => {

        it('should logout successfully', async () => {
            const response = await request(app)
                .post('/api/auth/logout');

            expect(response.status).toBe(200);
        });
    });

    // ===================== GET ME TESTS =====================
    describe('GET /api/auth/me', () => {
        let workerToken;
        let adminToken;

        beforeAll(async () => {
            // Login to get tokens
            const workerLogin = await loginAs(request, app, testUsers.workerPremium);
            workerToken = workerLogin.cookies;

            const adminLogin = await loginAs(request, app, testUsers.admin);
            adminToken = adminLogin.cookies;
        });

        it('should return user data when authenticated as Worker', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Cookie', workerToken);

            expect(response.status).toBe(200);
            expect(response.body.user).toBeDefined();
            expect(response.body.user.role).toBe('WORKER');
        });

        it('should return user data when authenticated as Admin', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Cookie', adminToken);

            expect(response.status).toBe(200);
            expect(response.body.user.role).toBe('ADMIN');
        });

        it('should reject request without authentication', async () => {
            const response = await request(app)
                .get('/api/auth/me');

            expect(response.status).toBe(401);
        });
    });

    // ===================== PUBLIC ENDPOINTS TESTS =====================
    describe('Public Endpoints', () => {

        it('should get hero stats without auth', async () => {
            const response = await request(app)
                .get('/api/public/hero-stats');

            expect(response.status).toBe(200);
            expect(response.body).toBeDefined();
        });

        it('should get UI features without auth', async () => {
            const response = await request(app)
                .get('/api/public/ui-features');

            expect(response.status).toBe(200);
            expect(response.body).toBeDefined();
        });

        it('should get public features without auth', async () => {
            const response = await request(app)
                .get('/api/public/features');

            expect(response.status).toBe(200);
            expect(response.body).toBeDefined();
        });
    });
});
