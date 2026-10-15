import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

interface SpeechSpeakerProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md';
  label?: string;
}

export const SpeechSpeaker: React.FC<SpeechSpeakerProps> = ({
  text,
  className = '',
  size = 'md',
  label,
}) => {
  const { isSpeaking, speakText, stopSpeaking, language } = useAccessibility();

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakText(text);
    }
  };

  const defaultLabel = language === 'hi' ? 'सुनें' : 'Listen';

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors border ${
        isSpeaking
          ? 'bg-amber-100 dark:bg-amber-900/40 border-amber-400 text-amber-900 dark:text-amber-200'
          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200'
      } ${className}`}
      aria-label={isSpeaking ? 'बोलना बंद करें' : 'आवाज़ में सुनें'}
      title={isSpeaking ? 'बोलना बंद करें' : 'आवाज़ में सुनें'}
    >
      {isSpeaking ? (
        <>
          <VolumeX size={size === 'sm' ? 14 : 16} className="text-amber-600 animate-pulse" />
          <span>{language === 'hi' ? 'रोकें' : 'Stop'}</span>
        </>
      ) : (
        <>
          <Volume2 size={size === 'sm' ? 14 : 16} className="text-[#0F2C59] dark:text-blue-400" />
          <span>{label || defaultLabel}</span>
        </>
      )}
    </button>
  );
};
