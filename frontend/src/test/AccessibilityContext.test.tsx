import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AccessibilityProvider, useAccessibility } from '../context/AccessibilityContext';

// Helper wrapper
function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <AccessibilityProvider>
      <MemoryRouter>{children}</MemoryRouter>
    </AccessibilityProvider>
  );
}

// A tiny test component to inspect context values
function ContextInspector() {
  const ctx = useAccessibility();
  return (
    <div>
      <span data-testid="language">{ctx.language}</span>
      <span data-testid="fontSize">{ctx.fontSize}</span>
      <span data-testid="darkMode">{String(ctx.darkMode)}</span>
      <span data-testid="highContrast">{String(ctx.highContrast)}</span>
      <span data-testid="speechRate">{ctx.speechRate}</span>
      <button data-testid="toggle-dark" onClick={ctx.toggleDarkMode}>Toggle Dark</button>
      <button data-testid="toggle-contrast" onClick={ctx.toggleContrast}>Toggle Contrast</button>
      <button data-testid="cycle-font" onClick={ctx.cycleFontSize}>Cycle Font</button>
      <button data-testid="set-en" onClick={() => ctx.setLanguage('en')}>English</button>
      <button data-testid="set-hi" onClick={() => ctx.setLanguage('hi')}>Hindi</button>
    </div>
  );
}

describe('AccessibilityContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.className = '';
  });

  it('provides default values', () => {
    render(<ContextInspector />, { wrapper: Wrapper });

    expect(screen.getByTestId('language')).toHaveTextContent('hi');
    expect(screen.getByTestId('fontSize')).toHaveTextContent('normal');
    expect(screen.getByTestId('darkMode')).toHaveTextContent('false');
    expect(screen.getByTestId('highContrast')).toHaveTextContent('false');
    expect(screen.getByTestId('speechRate')).toHaveTextContent('1');
  });

  it('toggles dark mode and applies body class', async () => {
    const user = userEvent.setup();
    render(<ContextInspector />, { wrapper: Wrapper });

    expect(screen.getByTestId('darkMode')).toHaveTextContent('false');

    await user.click(screen.getByTestId('toggle-dark'));

    expect(screen.getByTestId('darkMode')).toHaveTextContent('true');
    expect(document.body.classList.contains('dark-mode')).toBe(true);
    expect(localStorage.getItem('ds_dark_mode')).toBe('true');
  });

  it('toggles high contrast and applies body class', async () => {
    const user = userEvent.setup();
    render(<ContextInspector />, { wrapper: Wrapper });

    await user.click(screen.getByTestId('toggle-contrast'));

    expect(screen.getByTestId('highContrast')).toHaveTextContent('true');
    expect(document.body.classList.contains('high-contrast')).toBe(true);
  });

  it('cycles font size normal → large → xlarge → normal', async () => {
    const user = userEvent.setup();
    render(<ContextInspector />, { wrapper: Wrapper });

    expect(screen.getByTestId('fontSize')).toHaveTextContent('normal');

    await user.click(screen.getByTestId('cycle-font'));
    expect(screen.getByTestId('fontSize')).toHaveTextContent('large');
    expect(document.body.classList.contains('font-size-large')).toBe(true);

    await user.click(screen.getByTestId('cycle-font'));
    expect(screen.getByTestId('fontSize')).toHaveTextContent('xlarge');

    await user.click(screen.getByTestId('cycle-font'));
    expect(screen.getByTestId('fontSize')).toHaveTextContent('normal');
  });

  it('switches language to English and persists', async () => {
    const user = userEvent.setup();
    render(<ContextInspector />, { wrapper: Wrapper });

    await user.click(screen.getByTestId('set-en'));
    expect(screen.getByTestId('language')).toHaveTextContent('en');
    expect(localStorage.getItem('ds_language')).toBe('en');
  });

  it('calls speakText without crashing', () => {
    function SpeakTest() {
      const { speakText } = useAccessibility();
      return <button data-testid="speak" onClick={() => speakText('Hello')}>Speak</button>;
    }

    render(<SpeakTest />, { wrapper: Wrapper });
    // Should not throw
    screen.getByTestId('speak').click();
  });
});
