/**
 * Authentication Fixtures for E2E Tests
 * Provides pre-authenticated states for different user roles
 */

import { test as base, expect } from '@playwright/test';

// Test user credentials
export const TEST_USERS = {
    superAdmin: {
        email: 'superadmin@socialink.ma',
        password: 'superadmin123',
        role: 'SUPER_ADMIN'
    },
    admin: {
        email: 'admin@socialink.ma',
        password: 'admin123',
        role: 'ADMIN'
    },
    workerPending: {
        email: 'worker.pending@test.ma',
        password: 'test123',
        role: 'WORKER',
        status: 'PENDING'
    },
    workerValidated: {
        email: 'worker.nosub@test.ma',
        password: 'test123',
        role: 'WORKER',
        status: 'VALIDATED'
    },
    workerPremium: {
        email: 'worker.premium@test.ma',
        password: 'test123',
        role: 'WORKER',
        status: 'VALIDATED',
        subscription: 'PREMIUM'
    },
    workerRejected: {
        email: 'worker.rejected@test.ma',
        password: 'test123',
        role: 'WORKER',
        status: 'REJECTED'
    },
    establishmentPending: {
        email: 'etab.pending@test.ma',
        password: 'test123',
        role: 'ESTABLISHMENT',
        status: 'PENDING'
    },
    establishmentValidated: {
        email: 'etab.nosub@test.ma',
        password: 'test123',
        role: 'ESTABLISHMENT',
        status: 'VALIDATED'
    },
    establishmentPro: {
        email: 'etab.pro@test.ma',
        password: 'test123',
        role: 'ESTABLISHMENT',
        status: 'VALIDATED',
        subscription: 'PRO'
    },
    establishmentRejected: {
        email: 'etab.rejected@test.ma',
        password: 'test123',
        role: 'ESTABLISHMENT',
        status: 'REJECTED'
    }
};

/**
 * Helper function to login a user
 */
export async function loginUser(page, user) {
    await page.goto('/login');

    // Wait for login form to be visible
    await page.waitForSelector('form');

    // Fill in credentials
    await page.fill('input[type="email"], input[name="email"]', user.email);
    await page.fill('input[type="password"], input[name="password"]', user.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation after login
    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 });

    return page;
}

/**
 * Helper function to logout user
 */
export async function logoutUser(page) {
    // Try to find and click logout button
    const logoutButton = page.locator('button:has-text("Déconnexion"), button:has-text("Logout"), a:has-text("Déconnexion")');

    if (await logoutButton.isVisible()) {
        await logoutButton.click();
        await page.waitForURL('**/login**');
    } else {
        // Navigate directly to logout or home
        await page.goto('/');
    }
}

/**
 * Extended test with authentication helpers
 */
export const test = base.extend({
    // Worker authenticated page
    workerPage: async ({ page }, use) => {
        await loginUser(page, TEST_USERS.workerPremium);
        await use(page);
    },

    // Establishment authenticated page
    establishmentPage: async ({ page }, use) => {
        await loginUser(page, TEST_USERS.establishmentPro);
        await use(page);
    },

    // Admin authenticated page
    adminPage: async ({ page }, use) => {
        await loginUser(page, TEST_USERS.admin);
        await use(page);
    },

    // Super Admin authenticated page
    superAdminPage: async ({ page }, use) => {
        await loginUser(page, TEST_USERS.superAdmin);
        await use(page);
    },
});

export { expect };
