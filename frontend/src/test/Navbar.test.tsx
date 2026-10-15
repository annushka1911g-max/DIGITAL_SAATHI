import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AccessibilityProvider } from '../context/AccessibilityContext';
import { Navbar } from '../components/Navbar';
import { AuthProvider } from '../context/AuthContext';

function renderNavbar() {
  return render(
    <AccessibilityProvider>
      <AuthProvider>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </AuthProvider>
    </AccessibilityProvider>
  );
}

describe('Navbar Component', () => {
  beforeEach(() => {
    localStorage.clear();
    // Mock fetch to prevent API calls from AuthContext
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ detail: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  it('renders the Digital Saathi logo and brand', () => {
    renderNavbar();
    // DS logo text
    expect(screen.getByText('DS')).toBeInTheDocument();
    // Brand name appears in header and tagline
    expect(screen.getAllByText(/डिजिटल साथी/).length).toBeGreaterThan(0);
  });

  it('renders the 1930 cybercrime helpline banner', () => {
    renderNavbar();
    expect(screen.getByText(/1930/)).toBeInTheDocument();
  });

  it('shows login link when not authenticated', () => {
    renderNavbar();
    // Should have a login link/button
    const loginLink = screen.getByText(/लॉगिन|Login/i);
    expect(loginLink).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderNavbar();
    // Home link
    expect(screen.getByText(/मुख्य पृष्ठ|Home/i)).toBeInTheDocument();
    // Voice Saathi
    expect(screen.getByText(/वॉइस साथी|Voice Saathi/i)).toBeInTheDocument();
    // Scam Saathi
    expect(screen.getByText(/स्कैम साथी|Scam Saathi/i)).toBeInTheDocument();
  });

  it('has language toggle button', () => {
    renderNavbar();
    const langBtn = screen.getByText(/English|हिंदी/);
    expect(langBtn).toBeInTheDocument();
  });
});
