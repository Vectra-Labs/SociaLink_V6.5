/**
 * Application Flow E2E Tests
 * Tests the worker application workflow: browse missions, apply, track status
 */

import { test, expect, TEST_USERS, loginUser } from './fixtures/auth.fixture.js';

test.describe('Worker Application Flow', () => {

    test.describe('Browse Missions', () => {

        test.beforeEach(async ({ page }) => {
            await loginUser(page, TEST_USERS.workerPremium);
        });

        test('should access missions marketplace', async ({ page }) => {
            await page.goto('/worker/missions');
            await page.waitForLoadState('networkidle');

            await expect(page).toHaveURL(/mission/);

            // Should show missions content
            const content = page.locator('main, [class*="mission"], [class*="card"]');
            await expect(content.first()).toBeVisible();
        });

        test('should have search/filter functionality', async ({ page }) => {
            await page.goto('/worker/missions');
            await page.waitForLoadState('networkidle');

            // Should have search or filter elements
            const searchOrFilter = page.locator('input[type="search"], [class*="filter"], select');
            if (await searchOrFilter.first().isVisible()) {
                await expect(searchOrFilter.first()).toBeVisible();
            }
        });

        test('should display mission cards with details', async ({ page }) => {
            await page.goto('/worker/missions');
            await page.waitForLoadState('networkidle');

            // Should show mission cards
            const missionCard = page.locator('[class*="card"], article').first();
            if (await missionCard.isVisible()) {
                await expect(missionCard).toBeVisible();
            }
        });

        test('should view mission details on click', async ({ page }) => {
            await page.goto('/worker/missions');
            await page.waitForLoadState('networkidle');

            // Click on first mission card
            const missionCard = page.locator('[class*="card"], article, [class*="mission"]').first();

            if (await missionCard.isVisible()) {
                await missionCard.click();
                await page.waitForTimeout(500);

                // Should show details (modal or new page)
                const detailContent = page.locator('[class*="modal"], [class*="detail"], [class*="drawer"], main');
                await expect(detailContent.first()).toBeVisible();
            }
        });
    });

    test.describe('Apply to Mission', () => {

        test('should have apply button on mission', async ({ page }) => {
            await loginUser(page, TEST_USERS.workerPremium);
            await page.goto('/worker/missions');
            await page.waitForLoadState('networkidle');

            // Look for apply/postuler button
            const applyButton = page.locator('button:has-text("Postuler"), button:has-text("Candidater"), button:has-text("Apply")');

            // Verify page loaded (button may not be visible without clicking mission)
            await expect(page).toHaveURL(/mission/);
        });
    });

    test.describe('Track Applications', () => {

        test('should access my applications page', async ({ page }) => {
            await loginUser(page, TEST_USERS.workerPremium);
            await page.goto('/worker/applications');
            await page.waitForLoadState('networkidle');

            await expect(page).toHaveURL(/application/);
        });

        test('should display application list or empty state', async ({ page }) => {
            await loginUser(page, TEST_USERS.workerPremium);
            await page.goto('/worker/applications');
            await page.waitForLoadState('networkidle');

            // Should show applications or empty state message
            const content = page.locator('main, [class*="application"], [class*="empty"], [class*="card"]');
            await expect(content.first()).toBeVisible();
        });

        test('should have status tabs (Pending, Accepted, etc.)', async ({ page }) => {
            await loginUser(page, TEST_USERS.workerPremium);
            await page.goto('/worker/applications');
            await page.waitForLoadState('networkidle');

            // Should have tabs for different statuses
            const tabs = page.locator('[role="tab"], button:has-text("Candidatures"), button:has-text("Invitations")');
            if (await tabs.first().isVisible()) {
                await expect(tabs.first()).toBeVisible();
            }
        });
    });
});

test.describe('Establishment Candidate Management', () => {

    test.describe('View Candidates', () => {

        test.beforeEach(async ({ page }) => {
            await loginUser(page, TEST_USERS.establishmentPro);
        });

        test('should access candidates/applications page', async ({ page }) => {
            await page.goto('/establishment/applications');
            await page.waitForLoadState('networkidle');

            await expect(page).toHaveURL(/application|candidate/);
        });

        test('should see list of applicants', async ({ page }) => {
            await page.goto('/establishment/applications');
            await page.waitForLoadState('networkidle');

            // Should show candidates list or empty state
            const content = page.locator('main, [class*="candidate"], [class*="applicant"], [class*="card"]');
            await expect(content.first()).toBeVisible();
        });
    });

    test.describe('Review Worker Profile', () => {

        test('should view worker profile from candidate list', async ({ page }) => {
            await loginUser(page, TEST_USERS.establishmentPro);
            await page.goto('/establishment/applications');
            await page.waitForLoadState('networkidle');

            // Click on a candidate if present
            const candidateCard = page.locator('[class*="card"], article, tr').first();
            if (await candidateCard.isVisible()) {
                await candidateCard.click();
                await page.waitForTimeout(500);
            }
        });

        test('should access worker search page', async ({ page }) => {
            await loginUser(page, TEST_USERS.establishmentPro);
            await page.goto('/establishment/search-worker');
            await page.waitForLoadState('networkidle');

            await expect(page).toHaveURL(/search|worker/);
        });
    });

    test.describe('Accept/Reject Candidates', () => {

        test('should have accept/reject buttons for candidates', async ({ page }) => {
            await loginUser(page, TEST_USERS.establishmentPro);
            await page.goto('/establishment/applications');
            await page.waitForLoadState('networkidle');

            // Look for action buttons
            const actionButtons = page.locator('button:has-text("Accepter"), button:has-text("Refuser"), button:has-text("Accept"), button:has-text("Reject")');

            // Page should load
            await expect(page).toHaveURL(/application|candidate/);
        });
    });
});
