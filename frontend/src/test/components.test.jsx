import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { ThemeProvider } from '../../context/ThemeContext'

// Import component to test
import ThemeToggle from '../../components/ThemeToggle'

// Mock AuthContext
const mockAuthContext = {
    user: null,
    token: null,
    login: vi.fn(),
    logout: vi.fn(),
    loading: false,
}

const renderWithProviders = (component) => {
    return render(
        <BrowserRouter>
            <ThemeProvider>
                <AuthContext.Provider value={mockAuthContext}>
                    {component}
                </AuthContext.Provider>
            </ThemeProvider>
        </BrowserRouter>
    )
}

describe('ThemeToggle', () => {
    it('renders without crashing', () => {
        renderWithProviders(<ThemeToggle />)
        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('has accessible label', () => {
        renderWithProviders(<ThemeToggle />)
        const button = screen.getByRole('button')
        expect(button).toHaveAttribute('aria-label')
    })
})

describe('Basic App Tests', () => {
    it('should pass a basic sanity check', () => {
        expect(1 + 1).toBe(2)
    })

    it('validates environment setup', () => {
        expect(window).toBeDefined()
        expect(document).toBeDefined()
    })
})
