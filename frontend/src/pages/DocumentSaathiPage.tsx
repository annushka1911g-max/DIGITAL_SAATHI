import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Calendar,
  IndianRupee,
  CheckSquare,
  Trash2,
  Loader2,
  HelpCircle,
  Send,
  Bot,
  User as UserIcon,
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { SpeechSpeaker } from '../components/SpeechSpeaker';
import { VoiceInputButton } from '../components/VoiceInputButton';
import { api } from '../services/api';
import type { DocumentItem, DocumentSummary } from '../types';

export const DocumentSaathiPage: React.FC = () => {
  const { language } = useAccessibility();
  const isHi = language === 'hi';

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [summary, setSummary] = useState<DocumentSummary | null>(null);
  const [uploading, setUploading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);

  // Q&A state
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [chatLog, setChatLog] = useState<{ q: string; a: string; pages?: number[] }[]>([]);

  const fetchDocuments = async () => {
    try {
      const docs = await api.listDocuments();
      setDocuments(docs);
      if (docs.length > 0 && !selectedDoc) {
        handleSelectDocument(docs[0]);
      }
    } catch (err) {
      console.warn('Could not load documents (maybe not logged in):', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const newDoc = await api.uploadDocument(file);
      setDocuments((prev) => [newDoc, ...prev]);
      handleSelectDocument(newDoc);
    } catch (err: any) {
      console.error('File upload failed:', err);
      alert(
        isHi
          ? `दस्तावेज़ अपलोड करने में समस्या आई: ${err.message}`
          : `Failed to upload document: ${err.message}`
      );
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSelectDocument = async (doc: DocumentItem) => {
    setSelectedDoc(doc);
    setChatLog([]);
    setSummarizing(true);
    setSummary(null);

    try {
      const sum = await api.summarizeDocument(doc.id);
      setSummary(sum);
    } catch (err: any) {
      console.error('Failed to summarize document:', err);
    } finally {
      setSummarizing(false);
    }
  };

  const handleDeleteDocument = async (docId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(isHi ? 'क्या आप इस दस्तावेज़ को हटाना चाहते हैं?' : 'Delete this document?')) {
      return;
    }

    try {
      await api.deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      if (selectedDoc?.id === docId) {
        setSelectedDoc(null);
        setSummary(null);
        setChatLog([]);
      }
    } catch {
      alert(isHi ? 'दस्तावेज़ हटाने में त्रुटि।' : 'Failed to delete document.');
    }
  };

  const handleAskQuestion = async (qToSend?: string) => {
    const q = (qToSend || question).trim();
    if (!q || !selectedDoc || asking) return;

    setAsking(true);
    setQuestion('');

    try {
      const res = await api.askDocument(selectedDoc.id, q, language);
      setChatLog((prev) => [...prev, { q, a: res.answer, pages: res.page_references }]);
    } catch {
      setChatLog((prev) => [
        ...prev,
        {
          q,
          a: isHi
            ? 'माफ़ कीजिए, दस्तावेज़ से उत्तर खोजने में असमर्थ रहा।'
            : 'Sorry, could not find answer from the document text.',
        },
      ]);
    } finally {
      setAsking(false);
    }
  };

  const sampleDocPrompts = isHi
    ? ['इस बिल में अंतिम तारीख (Due Date) क्या है?', 'कुल देय राशि कितनी है?', 'बिल न भरने पर क्या होगा?']
    : ['What is the due date mentioned?', 'What is the total amount due?', 'What action is required?'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <FileText size={14} />
            <span>{isHi ? 'दस्तावेज़ साथी' : 'Document Intelligence'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            {isHi ? 'दस्तावेज़, बिल व सरकारी नोटिस समझें' : 'Simplify Bills, Notices & Official Documents'}
          </h1>
          <p className="text-sm text-teal-100">
            {isHi
              ? 'बिजली का बिल, पेंशन पत्र या बैंक नोटिस अपलोड करें। डिजिटल साथी तुरंत मुख्य बातें, अंतिम तारीख और राशि समझाएगा।'
              : 'Upload electricity bills, pension letters, or bank notices. Get simple summaries, key dates, and ask voice questions.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload & Doc List (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Upload Box */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-dashed border-teal-300 dark:border-teal-800 shadow-sm text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center mx-auto">
              <Upload size={24} />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              {isHi ? 'नया दस्तावेज़ अपलोड करें' : 'Upload New Document'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isHi ? 'PDF, फोटो (PNG, JPG) या टेक्स्ट फाइल' : 'Supports PDF, JPG, PNG or TXT files'}
            </p>

            <label className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm cursor-pointer shadow transition-colors">
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{isHi ? 'अपलोड हो रहा है...' : 'Uploading...'}</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>{isHi ? 'फ़ाइल चुनें (Choose File)' : 'Select File'}</span>
                </>
              )}
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.txt"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          {/* Documents List */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isHi ? 'आपके दस्तावेज़' : 'Your Documents'} ({documents.length})
            </h4>

            {documents.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                {isHi ? 'अभी तक कोई दस्तावेज़ अपलोड नहीं हुआ है।' : 'No documents uploaded yet.'}
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {documents.map((doc) => {
                  const isSelected = selectedDoc?.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => handleSelectDocument(doc)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 ring-1 ring-teal-500'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <FileText
                          size={18}
                          className={isSelected ? 'text-teal-600' : 'text-slate-400'}
                        />
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
                            {doc.original_filename}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {doc.page_count} {isHi ? 'पृष्ठ' : 'pages'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteDocument(doc.id, e)}
                        className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                        title={isHi ? 'हटाएं' : 'Delete'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Summary & Voice Q&A (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedDoc ? (
            <>
              {/* Document Summary Card */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
                  <div>
                    <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 uppercase">
                      {isHi ? 'सरल सारांश' : 'Document Summary'}
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                      {selectedDoc.original_filename}
                    </h2>
                  </div>

                  {summary && (
                    <SpeechSpeaker
                      text={`${summary.summary}. महत्वपूर्ण तिथियां: ${summary.important_dates.join(', ')}. राशियां: ${summary.amounts_mentioned.join(', ')}`}
                    />
                  )}
                </div>

                {summarizing ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-500">
                    <Loader2 size={24} className="animate-spin text-teal-600" />
                    <p className="text-sm">
                      {isHi ? 'दस्तावेज़ का विश्लेषण हो रहा है...' : 'Extracting and analyzing text...'}
                    </p>
                  </div>
                ) : summary ? (
                  <div className="space-y-4">
                    {/* Main plain summary */}
                    <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-medium bg-teal-50/50 dark:bg-slate-900/50 p-4 rounded-xl border border-teal-100 dark:border-teal-900/30">
                      {summary.summary}
                    </p>

                    {/* Extracted Dates & Amounts Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Dates */}
                      <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
                        <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 mb-1.5">
                          <Calendar size={15} />
                          <span>{isHi ? 'महत्वपूर्ण तिथियां (Important Dates):' : 'Important Dates:'}</span>
                        </h4>
                        {summary.important_dates && summary.important_dates.length > 0 ? (
                          <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
                            {summary.important_dates.map((date, i) => (
                              <li key={i} className="font-semibold">
                                • {date}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-slate-500 italic">
                            {isHi ? 'कोई विशिष्ट तारीख नहीं मिली।' : 'No specific dates found.'}
                          </p>
                        )}
                      </div>

                      {/* Amounts */}
                      <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
                        <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 mb-1.5">
                          <IndianRupee size={15} />
                          <span>{isHi ? 'उल्लिखित राशियां (Amounts):' : 'Amounts Mentioned:'}</span>
                        </h4>
                        {summary.amounts_mentioned && summary.amounts_mentioned.length > 0 ? (
                          <ul className="text-xs text-emerald-800 dark:text-emerald-200 space-y-1">
                            {summary.amounts_mentioned.map((amt, i) => (
                              <li key={i} className="font-semibold">
                                • {amt}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-slate-500 italic">
                            {isHi ? 'कोई राशि नहीं मिली।' : 'No amounts detected.'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Key Actions Required */}
                    {summary.actions_required && summary.actions_required.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1.5">
                          <CheckSquare size={15} className="text-teal-600" />
                          <span>{isHi ? 'आवश्यक कार्य (Next Steps):' : 'Actions Required:'}</span>
                        </h4>
                        <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                          {summary.actions_required.map((act, i) => (
                            <li key={i}>✓ {act}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Document Grounded Q&A Card */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
                  <HelpCircle size={20} className="text-teal-600" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {isHi ? 'इस दस्तावेज़ से जुड़े सवाल पूछें' : 'Ask Questions Grounded in Document'}
                  </h3>
                </div>

                {/* Sample Prompt Chips */}
                <div className="flex flex-wrap gap-2">
                  {sampleDocPrompts.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAskQuestion(p)}
                      className="text-xs bg-slate-100 hover:bg-teal-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors"
                    >
                      💡 {p}
                    </button>
                  ))}
                </div>

                {/* Q&A Chat Log */}
                {chatLog.length > 0 && (
                  <div className="space-y-3 pt-2">
                    {chatLog.map((item, idx) => (
                      <div key={idx} className="space-y-2">
                        {/* User Question */}
                        <div className="flex items-start justify-end gap-2">
                          <div className="bg-teal-700 text-white rounded-xl px-3.5 py-2 text-xs sm:text-sm">
                            {item.q}
                          </div>
                          <div className="w-6 h-6 rounded-full bg-teal-800 text-white flex items-center justify-center shrink-0 text-xs">
                            <UserIcon size={12} />
                          </div>
                        </div>

                        {/* Bot Answer */}
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 text-xs">
                            <Bot size={12} />
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200 space-y-1">
                            <p>{item.a}</p>
                            <SpeechSpeaker text={item.a} size="sm" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Question Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAskQuestion();
                  }}
                  className="flex items-center gap-2 pt-2"
                >
                  <VoiceInputButton
                    onTranscript={(txt) => {
                      setQuestion(txt);
                      handleAskQuestion(txt);
                    }}
                    size="sm"
                  />
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder={
                      isHi
                        ? 'इस दस्तावेज़ के बारे में पूछें...'
                        : 'Ask any question about this document...'
                    }
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                  <button
                    type="submit"
                    disabled={!question.trim() || asking}
                    className="bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white p-2.5 rounded-xl shadow transition-colors"
                  >
                    {asking ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 border border-slate-200 dark:border-slate-700 text-center space-y-3">
              <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-600" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">
                {isHi ? 'कोई दस्तावेज़ चयनित नहीं है' : 'No Document Selected'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                {isHi
                  ? 'बाईं तरफ से एक दस्तावेज़ चुनें या नया बिल/नोटिस अपलोड करें।'
                  : 'Select an existing document from the left or upload a new bill/notice.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
