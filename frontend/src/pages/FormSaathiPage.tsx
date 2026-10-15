import React, { useState, useEffect } from 'react';
import {
  FileQuestion,
  AlertCircle,
  BookOpen,
  ListChecks,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { SpeechSpeaker } from '../components/SpeechSpeaker';
import { api } from '../services/api';
import type { FormGuide } from '../types';

export const FormSaathiPage: React.FC = () => {
  const { language } = useAccessibility();
  const isHi = language === 'hi';

  const [forms, setForms] = useState<FormGuide[]>([]);
  const [selectedForm, setSelectedForm] = useState<FormGuide | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadForms = async () => {
      setLoading(true);
      try {
        const data = await api.listForms();
        setForms(data);
        if (data.length > 0) {
          setSelectedForm(data[0]);
        }
      } catch (err) {
        console.error('Failed to load forms:', err);
      } finally {
        setLoading(false);
      }
    };
    loadForms();
  }, []);

  const toggleDocCheck = (docName: string) => {
    setCheckedDocs((prev) => ({
      ...prev,
      [docName]: !prev[docName],
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <FileQuestion size={14} />
            <span>{isHi ? 'फॉर्म साथी' : 'Form Intelligence & Guidance'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            {isHi ? 'सरकारी व बैंक फॉर्म सरल भाषा में समझें' : 'Master Government & Banking Forms Effortlessly'}
          </h1>
          <p className="text-sm text-amber-100">
            {isHi
              ? 'कठिन सरकारी शब्दों (जैसे IFSC, Aadhaar Seeding, Nominee) का सरल अर्थ, जरूरी कागजात की चेकलिस्ट और गलतियों से बचने के उपाय।'
              : 'Plain-language field breakdowns, common mistakes to avoid, and required documents checklist.'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 size={32} className="animate-spin text-amber-600 mx-auto" />
          <p className="text-sm text-slate-500">
            {isHi ? 'फॉर्म सूची लोड हो रही है...' : 'Loading official forms catalog...'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form Selector (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isHi ? 'उपलब्ध योजनाएं व फॉर्म' : 'Available Scheme Forms'} ({forms.length})
            </h3>

            <div className="space-y-2">
              {forms.map((form) => {
                const isSelected = selectedForm?.form_id === form.form_id;
                return (
                  <div
                    key={form.form_id}
                    onClick={() => {
                      setSelectedForm(form);
                      setCheckedDocs({});
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-400'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                          {form.category}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {form.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                          {form.description}
                        </p>
                      </div>
                      <ChevronRight
                        size={18}
                        className={isSelected ? 'text-amber-600' : 'text-slate-400'}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Form Detailed Breakdown (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {selectedForm ? (
              <div className="space-y-6">
                {/* Overview Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
                    <div>
                      <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                        {selectedForm.department}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        {selectedForm.title}
                      </h2>
                    </div>
                    <SpeechSpeaker
                      text={`${selectedForm.title}. ${selectedForm.simple_explanation}`}
                    />
                  </div>

                  <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed bg-amber-50/60 dark:bg-slate-900/40 p-4 rounded-xl border border-amber-200/50 dark:border-amber-900/30">
                    {selectedForm.simple_explanation}
                  </p>

                  {/* Required Documents Checklist */}
                  {selectedForm.required_documents_hint &&
                    selectedForm.required_documents_hint.length > 0 && (
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                            <ListChecks size={16} className="text-amber-600" />
                            <span>
                              {isHi ? 'जरूरी कागजात (चेकलिस्ट):' : 'Required Documents Checklist:'}
                            </span>
                          </h4>
                          <span className="text-xs text-slate-500">
                            {Object.values(checkedDocs).filter(Boolean).length} /{' '}
                            {selectedForm.required_documents_hint.length}{' '}
                            {isHi ? 'तैयार' : 'ready'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {selectedForm.required_documents_hint.map((doc, i) => {
                            const isChecked = !!checkedDocs[doc];
                            return (
                              <label
                                key={i}
                                onClick={() => toggleDocCheck(doc)}
                                className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                                  isChecked
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-200'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}}
                                  className="accent-emerald-600 rounded"
                                />
                                <span>{doc}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                </div>

                {/* Form Fields Breakdown */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen size={18} className="text-amber-600" />
                    <span>
                      {isHi ? 'फॉर्म के कठिन शब्दों की आसान समझ:' : 'Step-by-Step Field Breakdown:'}
                    </span>
                  </h3>

                  <div className="space-y-4">
                    {selectedForm.fields && selectedForm.fields.length > 0 ? (
                      selectedForm.fields.map((f, idx) => (
                        <div
                          key={idx}
                          className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                                {f.display_label}{' '}
                                {f.is_mandatory && (
                                  <span className="text-red-500 text-xs font-semibold">
                                    ({isHi ? 'अनिवार्य' : 'Required'})
                                  </span>
                                )}
                              </h4>
                            </div>

                            <SpeechSpeaker
                              text={`${f.display_label}. इसका अर्थ: ${f.simple_explanation}. आम गलती: ${f.common_mistake}`}
                              size="sm"
                            />
                          </div>

                          {/* Simple Meaning */}
                          <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {isHi ? 'सरल अर्थ: ' : 'Meaning: '}
                            </span>
                            {f.simple_explanation}
                          </div>

                          {/* Common Mistake Alert */}
                          {f.common_mistake && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs text-red-800 dark:text-red-300 flex items-start gap-2">
                              <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
                              <div>
                                <span className="font-bold">
                                  {isHi ? 'आम गलती से बचें: ' : 'Common mistake: '}
                                </span>
                                {f.common_mistake}
                              </div>
                            </div>
                          )}

                          {/* Example input */}
                          {f.example_input && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-mono bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                              <span className="font-sans font-semibold text-slate-600 dark:text-slate-300">
                                {isHi ? 'उदाहरण: ' : 'Example input: '}
                              </span>
                              {f.example_input}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        {isHi ? 'कोई फील्ड विवरण उपलब्ध नहीं।' : 'No field breakdowns available.'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
