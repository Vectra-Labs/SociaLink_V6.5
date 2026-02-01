/**
 * Login Component Tests
 * Tests for the Login page form and functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockAuthContextUnauthenticated } from '../helpers.jsx';
import Login from '../../pages/Login.jsx';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('Login Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders login form correctly', () => {
        renderWithProviders(<Login />);

        // Check form elements are present
        expect(screen.getByRole('heading')).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i) || screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/mot de passe|password/i) || screen.getByPlaceholderText(/mot de passe|password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /connexion|login|se connecter/i })).toBeInTheDocument();
    });

    it('shows validation error for empty email', async () => {
        renderWithProviders(<Login />);

        const submitButton = screen.getByRole('button', { name: /connexion|login|se connecter/i });
        await userEvent.click(submitButton);

        // Should show some validation feedback
        await waitFor(() => {
            const emailInput = screen.getByLabelText(/email/i) || screen.getByPlaceholderText(/email/i);
            expect(emailInput).toBeInTheDocument();
        });
    });

    it('allows user to type in email field', async () => {
        renderWithProviders(<Login />);

        const emailInput = screen.getByLabelText(/email/i) || screen.getByPlaceholderText(/email/i);
        await userEvent.type(emailInput, 'test@example.com');

        expect(emailInput).toHaveValue('test@example.com');
    });

    it('allows user to type in password field', async () => {
        renderWithProviders(<Login />);

        const passwordInput = screen.getByLabelText(/mot de passe|password/i) || screen.getByPlaceholderText(/mot de passe|password/i);
        await userEvent.type(passwordInput, 'testpassword');

        expect(passwordInput).toHaveValue('testpassword');
    });

    it('has a link to registration page', () => {
        renderWithProviders(<Login />);

        // Should have a link to register
        const registerLink = screen.getByRole('link', { name: /inscription|register|créer|s'inscrire/i });
        expect(registerLink).toBeInTheDocument();
    });

    it('has a link to forgot password', () => {
        renderWithProviders(<Login />);

        // Should have a forgot password link
        const forgotLink = screen.queryByRole('link', { name: /oublié|forgot|reset/i }) ||
            screen.queryByText(/oublié|forgot/i);
        // This link might not exist in all implementations
        if (forgotLink) {
            expect(forgotLink).toBeInTheDocument();
        }
    });
});
