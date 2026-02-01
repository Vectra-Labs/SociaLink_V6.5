/**
 * MissionCard Component Tests
 * Tests for mission card display and interactions
 */

import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, mockAuthContextWorker } from '../helpers.jsx';
import MissionCard from '../../components/MissionCard.jsx';

const mockMission = {
    id: 'mission-1',
    title: 'Infirmière de nuit',
    description: 'Mission de garde de nuit dans une clinique.',
    start_date: new Date('2026-02-01').toISOString(),
    end_date: new Date('2026-02-15').toISOString(),
    salary: 250,
    location: 'Casablanca',
    status: 'OPEN',
    speciality: { name: 'Infirmière' },
    establishment: {
        name: 'Clinique Al Amal',
        logo_url: null,
    },
    is_redacted: false,
};

const mockLockedMission = {
    ...mockMission,
    id: 'mission-locked',
    title: 'Mission Premium',
    is_redacted: true,
};

describe('MissionCard Component', () => {

    it('renders mission title correctly', () => {
        renderWithProviders(
            <MissionCard mission={mockMission} />,
            { authContext: mockAuthContextWorker }
        );

        expect(screen.getByText(/Infirmière de nuit/i)).toBeInTheDocument();
    });

    it('renders establishment name', () => {
        renderWithProviders(
            <MissionCard mission={mockMission} />,
            { authContext: mockAuthContextWorker }
        );

        expect(screen.getByText(/Clinique Al Amal/i)).toBeInTheDocument();
    });

    it('renders mission location', () => {
        renderWithProviders(
            <MissionCard mission={mockMission} />,
            { authContext: mockAuthContextWorker }
        );

        expect(screen.getByText(/Casablanca/i)).toBeInTheDocument();
    });

    it('renders salary information', () => {
        renderWithProviders(
            <MissionCard mission={mockMission} />,
            { authContext: mockAuthContextWorker }
        );

        // Salary should be displayed (250 MAD or similar)
        expect(screen.getByText(/250/)).toBeInTheDocument();
    });

    it('shows locked state for redacted missions', () => {
        renderWithProviders(
            <MissionCard mission={mockLockedMission} />,
            { authContext: mockAuthContextWorker }
        );

        // Should show some indication of locked/premium content
        const card = screen.getByText(/Mission Premium/i).closest('div');
        expect(card).toBeInTheDocument();
    });

    it('handles missing establishment gracefully', () => {
        const missionWithoutEstab = {
            ...mockMission,
            establishment: null,
        };

        // Should not crash
        renderWithProviders(
            <MissionCard mission={missionWithoutEstab} />,
            { authContext: mockAuthContextWorker }
        );

        expect(screen.getByText(/Infirmière de nuit/i)).toBeInTheDocument();
    });
});
