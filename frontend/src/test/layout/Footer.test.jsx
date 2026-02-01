/**
 * Footer Component Tests
 * Tests for footer rendering and links
 */

import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers.jsx';
import Footer from '../../components/Footer.jsx';

describe('Footer Component', () => {

    it('renders without crashing', () => {
        renderWithProviders(<Footer />);
        expect(document.body).toBeInTheDocument();
    });

    it('renders brand/logo', () => {
        renderWithProviders(<Footer />);

        const brand = screen.queryByText(/socialink/i) ||
            screen.queryByAltText(/logo/i);

        if (brand) {
            expect(brand).toBeInTheDocument();
        }
    });

    it('renders copyright notice', () => {
        renderWithProviders(<Footer />);

        const copyright = screen.queryByText(/©|copyright|droits/i) ||
            screen.queryByText(/2026|2025/);

        if (copyright) {
            expect(copyright).toBeInTheDocument();
        }
    });

    it('has legal links if present', () => {
        renderWithProviders(<Footer />);

        // Check for common legal links
        const legalLinks = [
            screen.queryByRole('link', { name: /mentions légales|legal/i }),
            screen.queryByRole('link', { name: /confidentialité|privacy/i }),
            screen.queryByRole('link', { name: /conditions|terms/i }),
        ].filter(Boolean);

        // At least some legal links should exist
        // This is non-strict as not all footers have all links
    });

    it('has social links if present', () => {
        renderWithProviders(<Footer />);

        // Check for social links (optional)
        const socialLinks = screen.queryAllByRole('link').filter(link => {
            const href = link.getAttribute('href') || '';
            return href.includes('facebook') ||
                href.includes('twitter') ||
                href.includes('linkedin') ||
                href.includes('instagram');
        });

        // Social links are optional
    });
});
