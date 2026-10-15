import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  PhoneCall,
  ExternalLink,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { SpeechSpeaker } from '../components/SpeechSpeaker';
import { api } from '../services/api';
import type { ScamAnalysisResult } from '../types';

export const ScamDetectorPage: React.FC = () => {
  const { language } = useAccessibility();
  const isHi = language === 'hi';

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScamAnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);

  const sampleScams = [
    {
      title: isHi ? 'बिजली बिल फर्जी अलर्ट' : 'Electricity Disconnection Fake SMS',
      text: 'Dear customer, your electricity power will be disconnected tonight at 9:30 PM because previous month bill was not updated. Please contact our electricity officer at 9876543210 immediately.',
    },
    {
      title: isHi ? 'केबीसी / 25 लाख लॉटरी' : 'KBC 25 Lakhs Lottery Fraud',
      text: 'Congratulations! Your mobile number won Rs. 25,00,000 in KBC lottery. Contact WhatsApp manager at +919123456789 to claim prize. Do not share with anyone.',
    },
    {
      title: isHi ? 'बैंक केवाईसी ब्लॉक चेतावनी' : 'Bank KYC Blocked Warning',
      text: 'SBI ALERT: Dear user, your YONO account has been blocked today due to pending PAN KYC. Click http://bit.ly/sbi-kyc-update to verify your identity now.',
    },
    {
      title: isHi ? 'असली बैंक मैसेज (सुरक्षित)' : 'Genuine Bank Alert (Safe)',
      text: 'Dear Customer, your account ending XX4521 has been credited with Rs 2,500 on 12-Oct-2026. Available balance is Rs 14,230. - State Bank of India.',
    },
  ];

  const handleAnalyze = async (textToTest?: string) => {
    const text = (textToTest || inputText).trim();
    if (!text || loading) return;

    if (textToTest) {
      setInputText(textToTest);
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await api.analyzeScam(text, 'sms_text', language);
      setResult(data);
    } catch (err: any) {
      console.error('Failed to analyze scam:', err);
      alert(
        isHi
          ? 'जांच करने में असमर्थ। कृपया पुनः प्रयास करें।'
          : 'Unable to analyze message. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    const summary = `${isHi ? 'स्कैम रिपोर्ट' : 'Scam Report'}: ${result.risk_level}\n${result.verdict_summary}\n${result.safety_advice.join('\n')}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-700 via-red-700 to-rose-800 text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <ShieldAlert size={14} />
            <span>{isHi ? 'सुरक्षा व सतर्कता साथी' : 'Scam & Fraud Intelligence'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            {isHi ? 'संदिग्ध SMS, WhatsApp या लिंक की जांच करें' : 'Verify Suspicious Messages & Fraud Alerts'}
          </h1>
          <p className="text-sm text-rose-100 max-w-xl">
            {isHi
              ? 'आए दिन आने वाले फर्जी लॉटरी, बिजली बिल कटने, बैंक खाते ब्लॉक होने या जॉब ऑफर वाले मैसेज यहाँ पेस्ट करें और सच जानें।'
              : 'Paste suspicious texts, lottery wins, power disconnection threats, or KYC alerts to inspect for fraud.'}
          </p>
        </div>

        {/* 1930 Helpline Button */}
        <div className="bg-white/10 border border-white/20 p-4 rounded-xl text-center shrink-0 w-full md:w-auto">
          <p className="text-xs text-rose-200 font-semibold mb-1">
            {isHi ? 'धोखाधड़ी होने पर तुरंत डायल करें' : 'In Case of Financial Fraud'}
          </p>
          <a
            href="tel:1930"
            className="inline-flex items-center justify-center gap-2 bg-white text-red-700 font-extrabold px-5 py-2.5 rounded-lg text-lg shadow hover:bg-rose-50 transition-colors w-full"
          >
            <PhoneCall size={20} />
            <span>1930</span>
          </a>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{isHi ? 'संदेश या लिंक यहाँ पेस्ट करें:' : 'Paste message text or suspicious link:'}</span>
          </label>
          {inputText && (
            <button
              type="button"
              onClick={() => setInputText('')}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {isHi ? 'साफ़ करें' : 'Clear'}
            </button>
          )}
        </div>

        <textarea
          rows={4}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            isHi
              ? 'उदा. "आपका बिजली बिल बाकी है, आज रात 9:30 बजे बिजली काट दी जाएगी..."'
              : 'e.g., "Dear customer, your electricity power will be disconnected tonight at 9:30 PM..."'
          }
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
        />

        {/* Sample Templates */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {isHi ? 'या नीचे दिए गए आम फ्रॉड के उदाहरण चुनें:' : 'Or try one of these common fraud examples:'}
          </p>
          <div className="flex flex-wrap gap-2">
            {sampleScams.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAnalyze(sample.text)}
                className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors"
              >
                ⚡ {sample.title}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => handleAnalyze()}
            disabled={!inputText.trim() || loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition-all"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>{isHi ? 'जांच जारी है...' : 'Analyzing for threats...'}</span>
              </>
            ) : (
              <>
                <ShieldAlert size={18} />
                <span>{isHi ? 'सुरक्षा जांच शुरू करें' : 'Analyze Message Now'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results Display */}
      {result && (
        <div
          className={`rounded-2xl p-6 sm:p-8 border shadow-lg space-y-6 transition-all animate-in fade-in duration-300 ${
            result.risk_level === 'HIGH_RISK'
              ? 'bg-red-50/80 dark:bg-red-950/30 border-red-300 dark:border-red-900'
              : result.risk_level === 'SUSPICIOUS'
              ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-900'
              : 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-900'
          }`}
        >
          {/* Verdict Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              {result.risk_level === 'HIGH_RISK' ? (
                <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md">
                  <ShieldAlert size={28} />
                </div>
              ) : result.risk_level === 'SUSPICIOUS' ? (
                <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                  <AlertTriangle size={28} />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <ShieldCheck size={28} />
                </div>
              )}

              <div>
                <span
                  className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full ${
                    result.risk_level === 'HIGH_RISK'
                      ? 'bg-red-600 text-white'
                      : result.risk_level === 'SUSPICIOUS'
                      ? 'bg-amber-500 text-slate-950 font-extrabold'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {result.risk_level === 'HIGH_RISK'
                    ? isHi ? 'अत्यधिक खतरनाक (HIGH RISK)' : 'HIGH RISK / DANGEROUS'
                    : result.risk_level === 'SUSPICIOUS'
                    ? isHi ? 'संदिग्ध (SUSPICIOUS)' : 'SUSPICIOUS'
                    : isHi ? 'सुरक्षित प्रतीत होता है (SAFE)' : 'SAFE / LOW RISK'}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {result.risk_level === 'HIGH_RISK'
                    ? isHi ? 'सावधान! यह एक फर्जी/धोखाधड़ी वाला मैसेज है' : 'Warning! This is a fraudulent scam message'
                    : result.risk_level === 'SUSPICIOUS'
                    ? isHi ? 'सतर्क रहें! इसमें संदेहास्पद बातें हैं' : 'Caution! Suspicious elements detected'
                    : isHi ? 'यह मैसेज सामान्य व सुरक्षित लगता है' : 'Message appears safe and routine'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <SpeechSpeaker text={`${result.verdict_summary}. ${result.safety_advice.join('. ')}`} />
              <button
                type="button"
                onClick={copyToClipboard}
                className="flex items-center gap-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copied ? (isHi ? 'कॉपी हुआ' : 'Copied') : (isHi ? 'कॉपी करें' : 'Share')}</span>
              </button>
            </div>
          </div>

          {/* Simple Explanation */}
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {isHi ? 'सरल शब्दों में सारांश:' : 'Plain Explanation:'}
            </h4>
            <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {result.verdict_summary}
            </p>
          </div>

          {/* Reasons / Red Flags */}
          {result.reasons && result.reasons.length > 0 && (
            <div className="space-y-2 bg-white/70 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-bold text-red-700 dark:text-red-400 flex items-center gap-1.5">
                <AlertTriangle size={16} />
                <span>{isHi ? 'पहचाने गए खतरे व लाल झंडे (Red Flags):' : 'Identified Threat Indicators:'}</span>
              </h4>
              <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                {result.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Safety Advice */}
          {result.safety_advice && result.safety_advice.length > 0 && (
            <div className="space-y-2 bg-white/70 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck size={16} />
                <span>{isHi ? 'आपको क्या करना चाहिए (सुरक्षा सलाह):' : 'What You Should Do (Safety Advice):'}</span>
              </h4>
              <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                {result.safety_advice.map((adv, i) => (
                  <li key={i}>{adv}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Cybercrime Helpline links */}
          <div className="p-4 bg-red-100 dark:bg-red-950/60 rounded-xl border border-red-300 dark:border-red-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs sm:text-sm text-red-900 dark:text-red-200">
              <span className="font-bold">
                {isHi ? 'अगर कोई आर्थिक नुकसान हुआ है:' : 'If financial loss has occurred:'}
              </span>{' '}
              {isHi
                ? 'तुरंत 1930 पर कॉल करें या National Cyber Crime Reporting Portal पर शिकायत दर्ज करें।'
                : 'Call 1930 immediately or file a report on the National Cyber Crime Portal.'}
            </div>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-red-700 hover:bg-red-800 text-white font-bold px-4 py-2 rounded-lg text-xs shrink-0 transition-colors"
            >
              <span>cybercrime.gov.in</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
