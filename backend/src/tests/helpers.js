/**
 * Test Helpers for Backend API Tests
 * Provides utility functions for authentication, token generation, etc.
 */

import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';

/**
 * Create a test JWT token for a given user
 */
export const createTestToken = (userId, role = 'WORKER') => {
    return jwt.sign(
        { id: userId, role },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
    );
};

/**
 * Test user credentials for different scenarios
 */
export const testUsers = {
    superAdmin: {
        email: 'superadmin@socialink.ma',
        password: 'superadmin123'
    },
    admin: {
        email: 'admin@socialink.ma',
        password: 'admin123'
    },
    workerPending: {
        email: 'worker.pending@test.ma',
        password: 'test123'
    },
    workerValidated: {
        email: 'worker.nosub@test.ma',
        password: 'test123'
    },
    workerPremium: {
        email: 'worker.premium@test.ma',
        password: 'test123'
    },
    workerRejected: {
        email: 'worker.rejected@test.ma',
        password: 'test123'
    },
    establishmentPending: {
        email: 'etab.pending@test.ma',
        password: 'test123'
    },
    establishmentValidated: {
        email: 'etab.nosub@test.ma',
        password: 'test123'
    },
    establishmentPro: {
        email: 'etab.pro@test.ma',
        password: 'test123'
    },
    establishmentRejected: {
        email: 'etab.rejected@test.ma',
        password: 'test123'
    }
};

/**
 * Get user by email from database
 */
export const getUserByEmail = async (email) => {
    return prisma.user.findUnique({
        where: { email },
        include: {
            worker: true,
            establishment: true
        }
    });
};

/**
 * Login helper - returns token and user data
 */
export const loginAs = async (request, app, credentials) => {
    const response = await request(app)
        .post('/api/auth/login')
        .send(credentials);

    return {
        token: response.body.token,
        user: response.body.user,
        status: response.status,
        cookies: response.headers['set-cookie']
    };
};

/**
 * Authenticated request helper
 */
export const authRequest = (request, app, method, url, token) => {
    const req = request(app)[method](url);
    if (token) {
        req.set('Cookie', `jwt=${token}`);
    }
    return req;
};
