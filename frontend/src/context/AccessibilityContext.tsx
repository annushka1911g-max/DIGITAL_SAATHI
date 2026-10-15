import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Language } from '../types';

interface AccessibilityContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  setFontSize: (size: 'normal' | 'large' | 'xlarge') => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;
  speechRate: number;
  setSpeechRate: (rate: number) => void;
  isSpeaking: boolean;
  speakText: (text: string, customLang?: Language) => void;
  stopSpeaking: () => void;
  toggleContrast: () => void;
  toggleDarkMode: () => void;
  cycleFontSize: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('ds_language') as Language) || 'hi';
  });

  const [fontSize, setFontSizeState] = useState<'normal' | 'large' | 'xlarge'>(() => {
    return (localStorage.getItem('ds_font_size') as any) || 'normal';
  });

  const [highContrast, setHighContrastState] = useState<boolean>(() => {
    return localStorage.getItem('ds_high_contrast') === 'true';
  });

  const [darkMode, setDarkModeState] = useState<boolean>(() => {
    return localStorage.getItem('ds_dark_mode') === 'true';
  });

  const [reducedMotion, setReducedMotionState] = useState<boolean>(() => {
    return localStorage.getItem('ds_reduced_motion') === 'true';
  });

  const [speechRate, setSpeechRateState] = useState<number>(() => {
    const saved = localStorage.getItem('ds_speech_rate');
    return saved ? parseFloat(saved) : 1.0;
  });

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Apply DOM classes whenever settings change
  useEffect(() => {
    const body = document.body;

    // Font size
    body.classList.remove('font-size-normal', 'font-size-large', 'font-size-xlarge');
    body.classList.add(`font-size-${fontSize}`);

    // High Contrast
    if (highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }

    // Dark Mode
    if (darkMode) {
      body.classList.add('dark-mode');
    } else {
      body.classList.remove('dark-mode');
    }

    // Reduced Motion
    if (reducedMotion) {
      body.classList.add('reduced-motion');
    } else {
      body.classList.remove('reduced-motion');
    }
  }, [fontSize, highContrast, darkMode, reducedMotion]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('ds_language', lang);
  };

  const setFontSize = (size: 'normal' | 'large' | 'xlarge') => {
    setFontSizeState(size);
    localStorage.setItem('ds_font_size', size);
  };

  const cycleFontSize = () => {
    if (fontSize === 'normal') setFontSize('large');
    else if (fontSize === 'large') setFontSize('xlarge');
    else setFontSize('normal');
  };

  const setHighContrast = (val: boolean) => {
    setHighContrastState(val);
    localStorage.setItem('ds_high_contrast', String(val));
  };

  const toggleContrast = () => setHighContrast(!highContrast);

  const setDarkMode = (val: boolean) => {
    setDarkModeState(val);
    localStorage.setItem('ds_dark_mode', String(val));
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const setReducedMotion = (val: boolean) => {
    setReducedMotionState(val);
    localStorage.setItem('ds_reduced_motion', String(val));
  };

  const setSpeechRate = (rate: number) => {
    setSpeechRateState(rate);
    localStorage.setItem('ds_speech_rate', String(rate));
  };

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const speakText = useCallback(
    (text: string, customLang?: Language) => {
      if (!('speechSynthesis' in window)) {
        console.warn('Speech synthesis not supported in this browser.');
        return;
      }

      window.speechSynthesis.cancel();

      // Clean markdown tags or bullets from text for natural speech
      const cleaned = text
        .replace(/[*#_`]/g, '')
        .replace(/https?:\/\/\S+/g, 'link')
        .trim();

      if (!cleaned) return;

      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.rate = speechRate;
      const targetLang = customLang || language;
      utterance.lang = targetLang === 'hi' ? 'hi-IN' : 'en-IN';

      // Pick best matching voice
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(
        (v) => v.lang.startsWith(targetLang === 'hi' ? 'hi' : 'en')
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [language, speechRate]
  );

  return (
    <AccessibilityContext.Provider
      value={{
        language,
        setLanguage,
        fontSize,
        setFontSize,
        highContrast,
        setHighContrast,
        darkMode,
        setDarkMode,
        reducedMotion,
        setReducedMotion,
        speechRate,
        setSpeechRate,
        isSpeaking,
        speakText,
        stopSpeaking,
        toggleContrast,
        toggleDarkMode,
        cycleFontSize,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
