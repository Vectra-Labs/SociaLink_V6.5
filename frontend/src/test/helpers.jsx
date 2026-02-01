/**
 * Test Helpers for Frontend Components
 * Provides render utilities with all necessary providers
 */

import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { vi } from 'vitest';

// Create a fresh QueryClient for each test
const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            gcTime: 0,
        },
    },
});

// Default mock auth context - unauthenticated
export const mockAuthContextUnauthenticated = {
    user: null,
    token: null,
    login: vi.fn(),
    logout: vi.fn(),
    loading: false,
    isAuthenticated: false,
};

// Mock auth context - authenticated worker
export const mockAuthContextWorker = {
    user: {
        id: 'worker-1',
        email: 'worker.premium@test.ma',
        role: 'WORKER',
        worker: {
            id: 'w1',
            first_name: 'Test',
            last_name: 'Worker',
            validation_status: 'VALIDATED',
        }
    },
    token: 'test-token-worker',
    login: vi.fn(),
    logout: vi.fn(),
    loading: false,
    isAuthenticated: true,
};

// Mock auth context - authenticated establishment
export const mockAuthContextEstablishment = {
    user: {
        id: 'estab-1',
        email: 'etab.pro@test.ma',
        role: 'ESTABLISHMENT',
        establishment: {
            id: 'e1',
            name: 'Test Clinic',
            validation_status: 'VALIDATED',
        }
    },
    token: 'test-token-establishment',
    login: vi.fn(),
    logout: vi.fn(),
    loading: false,
    isAuthenticated: true,
};

// Mock auth context - authenticated admin
export const mockAuthContextAdmin = {
    user: {
        id: 'admin-1',
        email: 'admin@socialink.ma',
        role: 'ADMIN',
    },
    token: 'test-token-admin',
    login: vi.fn(),
    logout: vi.fn(),
    loading: false,
    isAuthenticated: true,
};

// Mock auth context - authenticated super admin
export const mockAuthContextSuperAdmin = {
    user: {
        id: 'superadmin-1',
        email: 'superadmin@socialink.ma',
        role: 'SUPER_ADMIN',
    },
    token: 'test-token-superadmin',
    login: vi.fn(),
    logout: vi.fn(),
    loading: false,
    isAuthenticated: true,
};

/**
 * Render component with all providers
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Options
 * @param {Object} options.authContext - Auth context values to use
 * @param {String} options.route - Initial route
 */
export const renderWithProviders = (
    ui,
    {
        authContext = mockAuthContextUnauthenticated,
        route = '/',
        ...renderOptions
    } = {}
) => {
    window.history.pushState({}, 'Test page', route);

    const queryClient = createTestQueryClient();

    return render(
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <ThemeProvider>
                    <AuthContext.Provider value={authContext}>
                        {ui}
                    </AuthContext.Provider>
                </ThemeProvider>
            </BrowserRouter>
        </QueryClientProvider>,
        renderOptions
    );
};

/**
 * Re-export everything from testing-library
 */
export * from '@testing-library/react';
export { renderWithProviders as render };
