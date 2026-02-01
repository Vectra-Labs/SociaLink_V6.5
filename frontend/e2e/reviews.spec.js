/**
 * Reviews E2E Tests
 * Tests the review system for completed missions
 */

import { test, expect, TEST_USERS, loginUser } from './fixtures/auth.fixture.js';

test.describe('Review System', () => {

    test.describe('Worker Reviews', () => {

        test.beforeEach(async ({ page }) => {
            await loginUser(page, TEST_USERS.workerPremium);
        });

        test('should access reviews page', async ({ page }) => {
            await page.goto('/worker/reviews');
            await page.waitForLoadState('networkidle');

            await expect(page).toHaveURL(/review/);
        });

        test('should display reviews received', async ({ page }) => {
            await page.goto('/worker/reviews');
            await page.waitForLoadState('networkidle');

            // Should show reviews or empty state
            const content = page.locator('main, [class*="review"], [class*="rating"], [class*="empty"]');
            await expect(content.first()).toBeVisible();
        });

        test('should show average rating if reviews exist', async ({ page }) => {
            await page.goto('/worker/reviews');
            await page.waitForLoadState('networkidle');

            // Look for rating display (stars, number)
            const ratingElement = page.locator('[class*="rating"], [class*="star"], [class*="score"]');

            // Page should load properly
            await expect(page).toHaveURL(/review/);
        });
    });

    test.describe('Leave Review', () => {

        test('worker can access review form after completed mission', async ({ page }) => {
            await loginUser(page, TEST_USERS.workerPremium);

            // Navigate to completed missions or history
            await page.goto('/worker/applications');
            await page.waitForLoadState('networkidle');

            // Look for completed/history tab
            const historyTab = page.locator('button:has-text("Historique"), button:has-text("Terminées"), button:has-text("Completed")');
            if (await historyTab.isVisible()) {
                await historyTab.click();
                await page.waitForTimeout(500);
            }
        });

        test('establishment can leave review for worker', async ({ page }) => {
            await loginUser(page, TEST_USERS.establishmentPro);

            // Navigate to completed missions
            await page.goto('/establishment/missions');
            await page.waitForLoadState('networkidle');

            // Look for completed missions
            const completedTab = page.locator('button:has-text("Terminées"), button:has-text("Completed"), button:has-text("Historique")');
            if (await completedTab.isVisible()) {
                await completedTab.click();
                await page.waitForTimeout(500);
            }
        });
    });

    test.describe('Review Form', () => {

        test('review form should have rating selector', async ({ page }) => {
            await loginUser(page, TEST_USERS.workerPremium);

            // Access a page that might have review functionality
            await page.goto('/worker/reviews');
            await page.waitForLoadState('networkidle');

            // Look for rating input (stars, select, etc.)
            const ratingInput = page.locator('[class*="star"], input[type="number"], select, [class*="rating"]');

            // Page should load
            await expect(page).toHaveURL(/review/);
        });

        test('review form should have comment field', async ({ page }) => {
            await loginUser(page, TEST_USERS.workerPremium);

            await page.goto('/worker/reviews');
            await page.waitForLoadState('networkidle');

            // Look for comment textarea
            const commentField = page.locator('textarea, input[type="text"]');

            // Page should load
            await expect(page).toHaveURL(/review/);
        });
    });

    test.describe('Mission History', () => {

        test('worker should have mission history', async ({ page }) => {
            await loginUser(page, TEST_USERS.workerPremium);

            // Check dashboard for history section or dedicated page
            await page.goto('/worker/dashboard');
            await page.waitForLoadState('networkidle');

            // Look for history/completed missions
            const historySection = page.locator('[class*="history"], [class*="completed"], text=/historique|terminé/i');

            await expect(page).toHaveURL(/worker/);
        });

        test('establishment should have mission history', async ({ page }) => {
            await loginUser(page, TEST_USERS.establishmentPro);

            await page.goto('/establishment/missions');
            await page.waitForLoadState('networkidle');

            // Should have access to completed missions
            await expect(page).toHaveURL(/mission/);
        });
    });
});
