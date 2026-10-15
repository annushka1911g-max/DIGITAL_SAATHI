import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AccessibilityProvider } from '../context/AccessibilityContext';
import { VoiceInputButton } from '../components/VoiceInputButton';

describe('VoiceInputButton Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders microphone button with fallback when speech recognition is not supported', () => {
    // Ensure no window.SpeechRecognition
    delete (window as any).SpeechRecognition;
    delete (window as any).webkitSpeechRecognition;

    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const onTranscript = vi.fn();

    render(
      <AccessibilityProvider>
        <VoiceInputButton onTranscript={onTranscript} />
      </AccessibilityProvider>
    );

    const btn = screen.getByRole('button');
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);
    expect(alertMock).toHaveBeenCalled();
  });

  it('initializes speech recognition and starts recording when clicked', () => {
    const startMock = vi.fn();
    const abortMock = vi.fn();

    class MockSpeechRecognition {
      continuous = false;
      interimResults = false;
      lang = 'hi-IN';
      onstart: (() => void) | null = null;
      onresult: ((event: any) => void) | null = null;
      onerror: ((event: any) => void) | null = null;
      onend: (() => void) | null = null;
      start = startMock;
      abort = abortMock;
      stop = vi.fn();
    }

    (window as any).SpeechRecognition = MockSpeechRecognition;

    const onTranscript = vi.fn();
    render(
      <AccessibilityProvider>
        <VoiceInputButton onTranscript={onTranscript} />
      </AccessibilityProvider>
    );

    const btn = screen.getByRole('button');
    fireEvent.click(btn);

    expect(startMock).toHaveBeenCalled();
  });
});
