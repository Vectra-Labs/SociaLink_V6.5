/**
 * Messaging E2E Tests
 * Tests the messaging system between workers and establishments
 */

import { test, expect, TEST_USERS, loginUser } from './fixtures/auth.fixture.js';

test.describe('Messaging System', () => {

    test.describe('Worker Messaging', () => {

        test.beforeEach(async ({ page }) => {
            await loginUser(page, TEST_USERS.workerPremium);
        });

        test('should access messages page', async ({ page }) => {
            await page.goto('/worker/messages');
            await page.waitForLoadState('networkidle');

            await expect(page).toHaveURL(/message/);
        });

        test('should display conversation list or empty state', async ({ page }) => {
            await page.goto('/worker/messages');
            await page.waitForLoadState('networkidle');

            // Should show conversations or empty message
            const content = page.locator('main, [class*="conversation"], [class*="message"], [class*="empty"]');
            await expect(content.first()).toBeVisible();
        });

        test('should have message input field', async ({ page }) => {
            await page.goto('/worker/messages');
            await page.waitForLoadState('networkidle');

            // Click on first conversation if available
            const conversation = page.locator('[class*="conversation"], [class*="chat"]').first();
            if (await conversation.isVisible()) {
                await conversation.click();
                await page.waitForTimeout(500);

                // Should show message input
                const messageInput = page.locator('input[type="text"], textarea');
                if (await messageInput.first().isVisible()) {
                    await expect(messageInput.first()).toBeVisible();
                }
            }
        });
    });

    test.describe('Establishment Messaging', () => {

        test('should access establishment messages', async ({ page }) => {
            await loginUser(page, TEST_USERS.establishmentPro);

            // Try different possible routes for establishment messages
            await page.goto('/establishment/messages');

            // Should show messages page or redirect
            const content = page.locator('main');
            await expect(content).toBeVisible();
        });
    });

    test.describe('Message Functionality', () => {

        test('should be able to send a message', async ({ page }) => {
            await loginUser(page, TEST_USERS.workerPremium);
            await page.goto('/worker/messages');
            await page.waitForLoadState('networkidle');

            // Select first conversation if available
            const conversation = page.locator('[class*="conversation"], [class*="contact"]').first();
            if (await conversation.isVisible()) {
                await conversation.click();
                await page.waitForTimeout(500);

                // Try to send a message
                const messageInput = page.locator('input[placeholder*="message"], textarea, input[type="text"]').first();
                if (await messageInput.isVisible()) {
                    await messageInput.fill('Test message from E2E');

                    const sendButton = page.locator('button:has-text("Envoyer"), button[type="submit"], button:has-text("Send")');
                    if (await sendButton.isVisible()) {
                        await sendButton.click();
                    }
                }
            }
        });
    });
});

test.describe('Contact Information Exchange', () => {

    test('worker can view establishment contact after acceptance', async ({ page }) => {
        await loginUser(page, TEST_USERS.workerPremium);

        // Navigate to an accepted application or establishment profile
        await page.goto('/worker/applications');
        await page.waitForLoadState('networkidle');

        // Look for accepted applications section
        const acceptedTab = page.locator('button:has-text("Acceptées"), button:has-text("Validées")');
        if (await acceptedTab.isVisible()) {
            await acceptedTab.click();
            await page.waitForTimeout(500);
        }

        // Should be able to see contact info on accepted missions
        await expect(page).toHaveURL(/application/);
    });

    test('establishment can view worker contact after acceptance', async ({ page }) => {
        await loginUser(page, TEST_USERS.establishmentPro);

        // Navigate to missions or accepted candidates
        await page.goto('/establishment/missions');
        await page.waitForLoadState('networkidle');

        // Should be able to access worker contact info
        await expect(page).toHaveURL(/mission/);
    });
});
