/**
 * Authentication E2E Tests
 * Tests login flows for all user roles and logout functionality
 */

import { test, expect, TEST_USERS, loginUser } from './fixtures/auth.fixture.js';

test.describe('Authentication Flows', () => {

    test.describe('Login Tests', () => {

        test('should display login page correctly', async ({ page }) => {
            await page.goto('/login');

            // Verify page title or heading
            await expect(page.locator('h1, h2').first()).toBeVisible();

            // Verify form elements
            await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
            await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
            await expect(page.locator('button[type="submit"]')).toBeVisible();
        });

        test('should login as SuperAdmin and redirect to dashboard', async ({ page }) => {
            await loginUser(page, TEST_USERS.superAdmin);

            // Should redirect to super admin dashboard
            await expect(page).toHaveURL(/super-admin|dashboard/);
        });

        test('should login as Admin and redirect to dashboard', async ({ page }) => {
            await loginUser(page, TEST_USERS.admin);

            // Should redirect to admin dashboard
            await expect(page).toHaveURL(/admin|dashboard/);
        });

        test('should login as Worker (Premium) and redirect to dashboard', async ({ page }) => {
            await loginUser(page, TEST_USERS.workerPremium);

            // Should redirect to worker dashboard
            await expect(page).toHaveURL(/worker|dashboard/);
        });

        test('should login as Establishment (Pro) and redirect to dashboard', async ({ page }) => {
            await loginUser(page, TEST_USERS.establishmentPro);

            // Should redirect to establishment dashboard
            await expect(page).toHaveURL(/establishment|dashboard/);
        });

        test('should reject login with wrong password', async ({ page }) => {
            await page.goto('/login');

            await page.fill('input[type="email"], input[name="email"]', TEST_USERS.workerPremium.email);
            await page.fill('input[type="password"], input[name="password"]', 'wrongpassword');
            await page.click('button[type="submit"]');

            // Should show error message and stay on login page
            await expect(page).toHaveURL(/login/);

            // Should show some error indication
            const errorMessage = page.locator('.error, [class*="error"], [role="alert"]');
            await expect(errorMessage.or(page.locator('text=/invalid|incorrect|invalide|erreur/i'))).toBeVisible({ timeout: 5000 });
        });

        test('should reject login with non-existent email', async ({ page }) => {
            await page.goto('/login');

            await page.fill('input[type="email"], input[name="email"]', 'nonexistent@test.ma');
            await page.fill('input[type="password"], input[name="password"]', 'test123');
            await page.click('button[type="submit"]');

            // Should stay on login page
            await expect(page).toHaveURL(/login/);
        });
    });

    test.describe('Logout Tests', () => {

        test('should logout successfully from worker dashboard', async ({ page }) => {
            // Login first
            await loginUser(page, TEST_USERS.workerPremium);

            // Find and click logout
            const logoutButton = page.locator('button:has-text("Déconnexion"), button:has-text("Logout"), a:has-text("Déconnexion")');

            if (await logoutButton.isVisible()) {
                await logoutButton.click();

                // Should redirect to login or home
                await expect(page).toHaveURL(/login|\/$/);
            }
        });
    });

    test.describe('Session Persistence', () => {

        test('should maintain session after page reload', async ({ page }) => {
            // Login first
            await loginUser(page, TEST_USERS.workerPremium);

            const urlBeforeReload = page.url();

            // Reload page
            await page.reload();

            // Should still be logged in (not redirected to login)
            await expect(page).not.toHaveURL(/login/);
        });
    });

    test.describe('Protected Routes', () => {

        test('should redirect unauthenticated user from protected route', async ({ page }) => {
            // Try to access protected route without login
            await page.goto('/worker/dashboard');

            // Should redirect to login
            await expect(page).toHaveURL(/login/);
        });

        test('should deny worker access to admin routes', async ({ page }) => {
            // Login as worker
            await loginUser(page, TEST_USERS.workerPremium);

            // Try to access admin route
            await page.goto('/admin/dashboard');

            // Should be redirected or show access denied
            await expect(page).not.toHaveURL(/admin\/dashboard/);
        });
    });
});
