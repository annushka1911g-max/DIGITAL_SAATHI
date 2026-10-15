import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Type,
  Sun,
  Moon,
  Eye,
  Languages,
  Volume2,
  X,
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export const AccessibilityControls: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    language,
    setLanguage,
    fontSize,
    setFontSize,
    highContrast,
    toggleContrast,
    darkMode,
    toggleDarkMode,
    speechRate,
    setSpeechRate,
  } = useAccessibility();

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="सुगमता सेटिंग्स खोलें (Accessibility Settings)"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#0F2C59] text-white px-4 py-3 rounded-full shadow-2xl hover:bg-[#1E4E8C] focus:ring-4 focus:ring-blue-400 focus:outline-none transition-all transform hover:scale-105 border-2 border-white/20"
      >
        <SlidersHorizontal size={20} />
        <span className="font-semibold text-sm">
          {language === 'hi' ? 'सुगमता (A+)' : 'Accessibility'}
        </span>
      </button>

      {/* Floating Drawer Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 transition-all animate-in fade-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="text-[#0F2C59] dark:text-blue-400" size={22} />
                <h3 className="text-lg font-bold">
                  {language === 'hi' ? 'सुगमता विकल्प (Accessibility)' : 'Accessibility Controls'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 pt-4">
              {/* Language Selection */}
              <div>
                <label className="text-sm font-semibold flex items-center gap-2 mb-2 text-slate-700 dark:text-slate-300">
                  <Languages size={18} className="text-[#0F2C59] dark:text-blue-400" />
                  {language === 'hi' ? 'भाषा (Language)' : 'Language'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLanguage('hi')}
                    className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                      language === 'hi'
                        ? 'bg-[#0F2C59] text-white border-[#0F2C59] shadow-sm'
                        : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    हिंदी (Hindi)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                      language === 'en'
                        ? 'bg-[#0F2C59] text-white border-[#0F2C59] shadow-sm'
                        : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Font Size Selection */}
              <div>
                <label className="text-sm font-semibold flex items-center gap-2 mb-2 text-slate-700 dark:text-slate-300">
                  <Type size={18} className="text-[#0F2C59] dark:text-blue-400" />
                  {language === 'hi' ? 'अक्षर का आकार (Text Size)' : 'Text Size'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFontSize('normal')}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                      fontSize === 'normal'
                        ? 'bg-[#0F2C59] text-white border-[#0F2C59]'
                        : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {language === 'hi' ? 'सामान्य (A)' : 'Normal (A)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSize('large')}
                    className={`py-2 px-3 rounded-lg border text-sm font-semibold transition-all ${
                      fontSize === 'large'
                        ? 'bg-[#0F2C59] text-white border-[#0F2C59]'
                        : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {language === 'hi' ? 'बड़ा (A+)' : 'Large (A+)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSize('xlarge')}
                    className={`py-2 px-3 rounded-lg border text-base font-bold transition-all ${
                      fontSize === 'xlarge'
                        ? 'bg-[#0F2C59] text-white border-[#0F2C59]'
                        : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {language === 'hi' ? 'बहुत बड़ा (A++)' : 'X-Large (A++)'}
                  </button>
                </div>
              </div>

              {/* High Contrast & Dark Mode */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={toggleContrast}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-semibold transition-all ${
                    highContrast
                      ? 'bg-black text-yellow-300 border-yellow-400 ring-2 ring-yellow-400'
                      : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Eye size={18} />
                  <span>{language === 'hi' ? 'उच्च कंट्रास्ट' : 'High Contrast'}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleDarkMode}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-semibold transition-all ${
                    darkMode
                      ? 'bg-slate-800 text-amber-300 border-amber-400 ring-2 ring-amber-400'
                      : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                  <span>{darkMode ? (language === 'hi' ? 'लाइट मोड' : 'Light Mode') : (language === 'hi' ? 'डार्क मोड' : 'Dark Mode')}</span>
                </button>
              </div>

              {/* Speech Rate Control */}
              <div>
                <div className="flex items-center justify-between text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-2">
                    <Volume2 size={18} className="text-[#0F2C59] dark:text-blue-400" />
                    {language === 'hi' ? 'आवाज़ की गति (Voice Speed)' : 'Speech Speed'}
                  </span>
                  <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">
                    {speechRate}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.25"
                  step="0.05"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="w-full accent-[#0F2C59] cursor-pointer"
                  aria-label="Speech rate slider"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>{language === 'hi' ? 'धीमी (0.75x)' : 'Slower'}</span>
                  <span>{language === 'hi' ? 'सामान्य (1.0x)' : 'Normal'}</span>
                  <span>{language === 'hi' ? 'तेज़ (1.25x)' : 'Faster'}</span>
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 bg-[#0F2C59] hover:bg-[#1E4E8C] text-white rounded-lg font-semibold shadow-md transition-colors"
                >
                  {language === 'hi' ? 'सेटिंग्स लागू करें' : 'Apply Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
