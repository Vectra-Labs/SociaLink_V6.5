import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        setupFiles: ['./src/tests/setup.js'],
        include: ['src/tests/**/*.test.js'],
        testTimeout: 30000,
        hookTimeout: 30000,
        coverage: {
            reporter: ['text', 'json', 'html'],
            exclude: ['node_modules/', 'src/tests/', 'prisma/']
        }
    }
});
