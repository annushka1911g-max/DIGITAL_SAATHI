import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Extend Window interface for Web Speech API
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  className = '',
  size = 'md',
}) => {
  const { language } = useAccessibility();
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recog = new SpeechRecognition();
    recog.continuous = false;
    recog.interimResults = false;
    recog.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

    recog.onstart = () => {
      setIsListening(true);
    };

    recog.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        onTranscript(transcript);
      }
    };

    recog.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recog.onend = () => {
      setIsListening(false);
    };

    setRecognition(recog);

    return () => {
      try {
        recog.abort();
      } catch {
        // cleanup
      }
    };
  }, [language, onTranscript]);

  const toggleListening = () => {
    if (!supported || !recognition) {
      alert(language === 'hi' 
        ? 'आपके ब्राउज़र में आवाज़ पहचान (Speech Recognition) समर्थित नहीं है। कृपया Chrome या Edge का उपयोग करें।'
        : 'Speech recognition is not supported in your browser. Please use Chrome or Edge.'
      );
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
        recognition.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const sizeClasses = {
    sm: 'p-2 text-sm',
    md: 'p-3 text-base',
    lg: 'p-4 text-lg',
  };

  const iconSizes = {
    sm: 18,
    md: 24,
    lg: 30,
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      aria-label={
        isListening
          ? language === 'hi' ? 'माइक बंद करें' : 'Stop voice recording'
          : language === 'hi' ? 'बोलकर बताएं' : 'Speak using microphone'
      }
      title={
        isListening
          ? language === 'hi' ? 'माइक बंद करें' : 'Stop voice recording'
          : language === 'hi' ? 'बोलकर बताएं' : 'Speak using microphone'
      }
      className={`relative inline-flex items-center justify-center rounded-full font-medium transition-all shadow-md focus:outline-none focus:ring-4 focus:ring-blue-300 ${
        isListening
          ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse shadow-red-500/50'
          : 'bg-[#0F2C59] hover:bg-[#1E4E8C] text-white shadow-blue-900/30'
      } ${sizeClasses[size]} ${className}`}
    >
      {isListening ? (
        <span className="flex items-center gap-2">
          <MicOff size={iconSizes[size]} className="animate-spin text-white" />
          <span className="text-xs font-bold tracking-wider uppercase">
            {language === 'hi' ? 'सुन रहे हैं...' : 'Listening...'}
          </span>
        </span>
      ) : (
        <span className="flex items-center gap-1.5">
          <Mic size={iconSizes[size]} />
          <span className="text-xs font-semibold">
            {language === 'hi' ? 'बोलें' : 'Speak'}
          </span>
        </span>
      )}
    </button>
  );
};
