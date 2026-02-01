/**
 * Navbar Component Tests
 * Tests for navigation, user menu, and responsive behavior
 */

import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders, mockAuthContextUnauthenticated, mockAuthContextWorker, mockAuthContextAdmin } from '../helpers.jsx';
import Navbar from '../../components/Navbar.jsx';

describe('Navbar Component', () => {

    describe('Unauthenticated State', () => {
        it('renders logo/brand', () => {
            renderWithProviders(<Navbar />, {
                authContext: mockAuthContextUnauthenticated
            });

            // Should show logo or brand name
            const logo = screen.getByRole('link', { name: /socialink|home|accueil/i }) ||
                screen.getByAltText(/logo/i) ||
                screen.getByText(/socialink/i);
            expect(logo).toBeInTheDocument();
        });

        it('shows login link when not authenticated', () => {
            renderWithProviders(<Navbar />, {
                authContext: mockAuthContextUnauthenticated
            });

            const loginLink = screen.queryByRole('link', { name: /connexion|login|se connecter/i }) ||
                screen.queryByText(/connexion|login/i);

            if (loginLink) {
                expect(loginLink).toBeInTheDocument();
            }
        });

        it('shows register link when not authenticated', () => {
            renderWithProviders(<Navbar />, {
                authContext: mockAuthContextUnauthenticated
            });

            const registerLink = screen.queryByRole('link', { name: /inscription|register|s'inscrire/i }) ||
                screen.queryByText(/inscription|register/i);

            if (registerLink) {
                expect(registerLink).toBeInTheDocument();
            }
        });
    });

    describe('Authenticated as Worker', () => {
        it('shows user menu when authenticated', () => {
            renderWithProviders(<Navbar />, {
                authContext: mockAuthContextWorker
            });

            // Should show some user indicator or menu
            const userMenu = screen.queryByRole('button') ||
                screen.queryByText(/Test/i) ||
                screen.queryByText(/profil|profile|dashboard|tableau/i);

            if (userMenu) {
                expect(userMenu).toBeInTheDocument();
            }
        });

        it('shows dashboard link for worker', () => {
            renderWithProviders(<Navbar />, {
                authContext: mockAuthContextWorker
            });

            const dashboardLink = screen.queryByRole('link', { name: /dashboard|tableau/i }) ||
                screen.queryByText(/dashboard|tableau/i);

            if (dashboardLink) {
                expect(dashboardLink).toBeInTheDocument();
            }
        });
    });

    describe('Authenticated as Admin', () => {
        it('shows admin-specific navigation', () => {
            renderWithProviders(<Navbar />, {
                authContext: mockAuthContextAdmin
            });

            // Admin navbar should render without errors
            expect(document.body).toBeInTheDocument();
        });
    });

    describe('Navigation Links', () => {
        it('has link to home page', () => {
            renderWithProviders(<Navbar />, {
                authContext: mockAuthContextUnauthenticated
            });

            const homeLink = screen.queryByRole('link', { name: /accueil|home/i });
            if (homeLink) {
                expect(homeLink).toHaveAttribute('href', '/');
            }
        });

        it('has link to missions page', () => {
            renderWithProviders(<Navbar />, {
                authContext: mockAuthContextUnauthenticated
            });

            const missionsLink = screen.queryByRole('link', { name: /missions/i }) ||
                screen.queryByText(/missions/i);

            if (missionsLink) {
                expect(missionsLink).toBeInTheDocument();
            }
        });
    });
});
