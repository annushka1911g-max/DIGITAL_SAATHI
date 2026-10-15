import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AccessibilityProvider } from '../context/AccessibilityContext';
import { AccessibilityControls } from '../components/AccessibilityControls';

function renderControls() {
  return render(
    <AccessibilityProvider>
      <AccessibilityControls />
    </AccessibilityProvider>
  );
}

describe('AccessibilityControls Component', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.className = '';
  });

  it('renders floating toggle button', () => {
    renderControls();
    const toggleBtn = screen.getByRole('button', { name: /सुगमता सेटिंग्स खोलें|Accessibility/i });
    expect(toggleBtn).toBeInTheDocument();
  });

  it('opens and closes accessibility drawer modal', () => {
    renderControls();
    const toggleBtn = screen.getByRole('button', { name: /सुगमता सेटिंग्स खोलें|Accessibility/i });
    fireEvent.click(toggleBtn);

    // Modal should be open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/सुगमता विकल्प|Accessibility Controls/i)).toBeInTheDocument();

    // Close button
    const closeBtn = screen.getByRole('button', { name: /Close/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('toggles language between Hindi and English', () => {
    renderControls();
    const toggleBtn = screen.getByRole('button', { name: /सुगमता सेटिंग्स खोलें|Accessibility/i });
    fireEvent.click(toggleBtn);

    const enBtn = screen.getByText('English');
    fireEvent.click(enBtn);

    // After switching to English, title should update
    expect(screen.getByText('Accessibility Controls')).toBeInTheDocument();
  });

  it('changes font size and updates document body class', () => {
    renderControls();
    const toggleBtn = screen.getByRole('button', { name: /सुगमता सेटिंग्स खोलें|Accessibility/i });
    fireEvent.click(toggleBtn);

    const largeBtn = screen.getByText(/बड़ा \(A\+\)|Large \(A\+\)/i);
    fireEvent.click(largeBtn);

    expect(document.body.classList.contains('font-size-large')).toBe(true);
  });

  it('toggles high contrast mode', () => {
    renderControls();
    const toggleBtn = screen.getByRole('button', { name: /सुगमता सेटिंग्स खोलें|Accessibility/i });
    fireEvent.click(toggleBtn);

    const contrastBtn = screen.getByText(/उच्च कंट्रास्ट|High Contrast/i);
    fireEvent.click(contrastBtn);

    expect(document.body.classList.contains('high-contrast')).toBe(true);
  });
});
