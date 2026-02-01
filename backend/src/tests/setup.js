/**
 * Test Setup for Backend API Tests
 * Initializes environment variables and database connection for testing
 */

import { config } from 'dotenv';
import { beforeAll, afterAll, vi } from 'vitest';

// Load environment variables
config();

// Mock email service to prevent actual emails during tests
vi.mock('../utils/emailService.js', () => ({
    sendVerificationEmail: vi.fn().mockResolvedValue(true),
    sendPasswordResetEmail: vi.fn().mockResolvedValue(true)
}));

// Global test setup
beforeAll(async () => {
    console.log('🧪 Starting API tests...');
});

// Global test teardown
afterAll(async () => {
    console.log('✅ API tests completed');
});
