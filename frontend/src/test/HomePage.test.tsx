import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AccessibilityProvider } from '../context/AccessibilityContext';
import { AuthProvider } from '../context/AuthContext';
import { HomePage } from '../pages/HomePage';

function renderHomePage() {
  return render(
    <AccessibilityProvider>
      <AuthProvider>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </AuthProvider>
    </AccessibilityProvider>
  );
}

describe('HomePage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ detail: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  it('renders the hero heading in Hindi (default)', () => {
    renderHomePage();
    expect(screen.getByText(/आपका डिजिटल साथी/)).toBeInTheDocument();
  });

  it('renders all 4 module cards', () => {
    renderHomePage();
    // Voice
    expect(screen.getByText(/वॉइस साथी/)).toBeInTheDocument();
    // Scam
    expect(screen.getByText(/स्कैम व फ्रॉड साथी/)).toBeInTheDocument();
    // Document
    expect(screen.getByText(/दस्तावेज़ साथी/)).toBeInTheDocument();
    // Form
    expect(screen.getByText(/फॉर्म साथी/)).toBeInTheDocument();
  });

  it('renders the emergency helpline 1930 card', () => {
    renderHomePage();
    const helplilneText = screen.getAllByText(/1930/);
    expect(helplilneText.length).toBeGreaterThanOrEqual(1);
  });

  it('renders accessibility guarantee section', () => {
    renderHomePage();
    expect(screen.getByText(/सभी नागरिकों के लिए सुगम/)).toBeInTheDocument();
  });

  it('has CTA button linking to voice assistant', () => {
    renderHomePage();
    const ctaLink = screen.getByText(/बोलकर पूछना शुरू करें/);
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink.closest('a')).toHaveAttribute('href', '/assistant');
  });
});
