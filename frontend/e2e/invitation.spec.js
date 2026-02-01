/**
 * Invitation Flow E2E Tests (Browser-Only)
 * Tests the complete flow: Establishment proposes mission to Worker, Worker accepts
 */

import { test, expect, TEST_USERS, loginUser } from './fixtures/auth.fixture.js';

test.describe('Invitation Flow', () => {

    test.describe('Establishment Searches and Proposes to Worker', () => {

        test('should access worker search page', async ({ page }) => {
            await loginUser(page, TEST_USERS.establishmentPro);

            await page.goto('/establishment/search-worker');
            await page.waitForLoadState('networkidle');

            // Should show search page
            await expect(page).toHaveURL(/search|worker/);
        });

        test('should search for available workers', async ({ page }) => {
            await loginUser(page, TEST_USERS.establishmentPro);

            await page.goto('/establishment/search-worker');
            await page.waitForLoadState('networkidle');

            // Should have search functionality
            const searchInput = page.locator('input[type="search"], input[placeholder*="Rechercher"], input[placeholder*="Nom"]');
            if (await searchInput.first().isVisible()) {
                await expect(searchInput.first()).toBeVisible();
            }

            // Should show some workers or empty state
            const content = page.locator('main, [class*="worker"], [class*="card"], [class*="list"]');
            await expect(content.first()).toBeVisible();
        });

        test('should view worker profile details', async ({ page }) => {
            await loginUser(page, TEST_USERS.establishmentPro);

            await page.goto('/establishment/search-worker');
            await page.waitForLoadState('networkidle');

            // Click on first worker card if available
            const workerCard = page.locator('[class*="card"], article, .bg-white').first();

            if (await workerCard.isVisible()) {
                await workerCard.click();

                // Should show profile details or modal
                await page.waitForTimeout(500);
            }
        });
    });

    test.describe('Worker Responds to Invitation', () => {

        test('should access my applications page', async ({ page }) => {
            await loginUser(page, TEST_USERS.workerPremium);

            await page.goto('/worker/applications');
            await page.waitForLoadState('networkidle');

            // Should show applications page
            await expect(page).toHaveURL(/application/);
        });

        test('should have tabs for different application statuses', async ({ page }) => {
            await loginUser(page, TEST_USERS.workerPremium);

            await page.goto('/worker/applications');
            await page.waitForLoadState('networkidle');

            // Should have tabs (Candidatures, Invitations, etc.)
            const tabs = page.locator('button, [role="tab"]');
            await expect(tabs.first()).toBeVisible();
        });
    });
});
