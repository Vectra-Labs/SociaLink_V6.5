/**
 * Admin Workflow E2E Tests
 * Tests admin and super-admin functionality: user validation, dashboard, settings
 */

import { test, expect, TEST_USERS, loginUser } from './fixtures/auth.fixture.js';

test.describe('Admin Workflow', () => {

    test.beforeEach(async ({ page }) => {
        await loginUser(page, TEST_USERS.admin);
    });

    test.describe('Dashboard', () => {

        test('should display admin dashboard', async ({ page }) => {
            await page.goto('/admin/dashboard');
            await page.waitForLoadState('networkidle');

            // Should show admin dashboard
            await expect(page).toHaveURL(/admin/);
        });

        test('should show platform statistics', async ({ page }) => {
            await page.goto('/admin/dashboard');

            // Dashboard should have stats
            const content = page.locator('main, [class*="dashboard"]');
            await expect(content.first()).toBeVisible();
        });
    });

    test.describe('User Validation', () => {

        test('should access pending users page', async ({ page }) => {
            await page.goto('/admin/validations');

            // Should show validation page
            await expect(page).toHaveURL(/validation|pending/);
        });

        test('should see list of pending users', async ({ page }) => {
            await page.goto('/admin/validations');
            await page.waitForLoadState('networkidle');

            // Wait for content to load
            await page.waitForLoadState('networkidle');

            // Should show pending users or empty state
            const content = page.locator('main, table, [class*="list"]');
            await expect(content.first()).toBeVisible();
        });
    });

    test.describe('Navigation', () => {

        test('should have admin sidebar', async ({ page }) => {
            await page.goto('/admin/dashboard');

            const sidebar = page.locator('nav, aside, [class*="sidebar"]');
            await expect(sidebar.first()).toBeVisible();
        });
    });
});

test.describe('Super Admin Workflow', () => {

    test.beforeEach(async ({ page }) => {
        await loginUser(page, TEST_USERS.superAdmin);
    });

    test.describe('Dashboard', () => {

        test('should display super admin dashboard', async ({ page }) => {
            await page.goto('/super-admin/dashboard');
            await page.waitForLoadState('networkidle');

            // Should show super admin dashboard
            await expect(page).toHaveURL(/super-admin/);
        });
    });

    test.describe('Settings', () => {

        test('should access platform settings', async ({ page }) => {
            await page.goto('/super-admin/settings');

            // Should show settings page
            await expect(page).toHaveURL(/settings/);
        });

        test('should see configuration options', async ({ page }) => {
            await page.goto('/super-admin/settings');

            // Settings should have form elements
            const content = page.locator('form, [class*="settings"], main');
            await expect(content.first()).toBeVisible();
        });
    });

    test.describe('User Management', () => {

        test('should access users list', async ({ page }) => {
            await page.goto('/super-admin/users');

            // Should show users management
            await expect(page).toHaveURL(/users/);
        });
    });

    test.describe('Subscriptions', () => {

        test('should access subscriptions management', async ({ page }) => {
            await page.goto('/super-admin/subscriptions');

            // Should show subscriptions page
            await expect(page).toHaveURL(/subscription/);
        });
    });

    test.describe('Access Control', () => {

        test('super admin should have access to admin routes', async ({ page }) => {
            await page.goto('/admin/dashboard');

            // Super admin should be able to access admin dashboard too
            await expect(page).not.toHaveURL(/login/);
        });
    });
});

test.describe('Role-Based Access Control', () => {

    test('regular admin should not access super-admin routes', async ({ page }) => {
        await loginUser(page, TEST_USERS.admin);

        await page.goto('/super-admin/dashboard');

        // Should be redirected or show access denied
        // Could redirect to admin dashboard or show forbidden
        await expect(page).not.toHaveURL(/super-admin\/dashboard/);
    });

    test('worker should not access admin routes', async ({ page }) => {
        await loginUser(page, TEST_USERS.workerPremium);

        await page.goto('/admin/dashboard');

        // Should be redirected
        await expect(page).not.toHaveURL(/admin\/dashboard/);
    });

    test('establishment should not access admin routes', async ({ page }) => {
        await loginUser(page, TEST_USERS.establishmentPro);

        await page.goto('/admin/dashboard');

        // Should be redirected
        await expect(page).not.toHaveURL(/admin\/dashboard/);
    });
});
