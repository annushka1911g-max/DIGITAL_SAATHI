import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AccessibilityProvider } from '../context/AccessibilityContext';
import { Footer } from '../components/Footer';

function renderFooter() {
  return render(
    <AccessibilityProvider>
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    </AccessibilityProvider>
  );
}

describe('Footer Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the Digital Saathi brand', () => {
    renderFooter();
    expect(screen.getByText(/डिजिटल साथी/)).toBeInTheDocument();
  });

  it('renders official helpline 1930', () => {
    renderFooter();
    expect(screen.getByText('1930')).toBeInTheDocument();
  });

  it('renders elder line 14567', () => {
    renderFooter();
    expect(screen.getByText('14567')).toBeInTheDocument();
  });

  it('renders consumer helpline 14443', () => {
    renderFooter();
    expect(screen.getByText('14443')).toBeInTheDocument();
  });

  it('has cybercrime.gov.in portal link', () => {
    renderFooter();
    const link = screen.getByText('National Cyber Crime Portal');
    expect(link.closest('a')).toHaveAttribute('href', 'https://cybercrime.gov.in');
    expect(link.closest('a')).toHaveAttribute('target', '_blank');
  });

  it('shows privacy assurance badge', () => {
    renderFooter();
    expect(screen.getByText(/गोपनीयता सुरक्षित|privacy is protected/i)).toBeInTheDocument();
  });

  it('displays copyright year', () => {
    renderFooter();
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });
});
