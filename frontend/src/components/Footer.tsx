import React from 'react';
import { ShieldCheck, Phone, Heart, ExternalLink } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export const Footer: React.FC = () => {
  const { language } = useAccessibility();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 font-black flex items-center justify-center text-sm">
                DS
              </div>
              <span className="text-xl font-bold text-white">डिजिटल साथी (Digital Saathi)</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md">
              {language === 'hi'
                ? 'भारत के प्रत्येक नागरिक, विशेषकर वरिष्ठ नागरिकों और ग्रामीण भाई-बहनों के लिए सुरक्षित और सरल आवाज़-आधारित डिजिटल सहायक।'
                : 'A voice-first digital accessibility and safety assistant empowering elderly citizens, rural populations, and everyday digital users across India.'}
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-800/40 w-fit">
              <ShieldCheck size={16} />
              <span>
                {language === 'hi'
                  ? 'आपकी गोपनीयता सुरक्षित है। कोई भी दस्तावेज़ बिना सहमति साझा नहीं किया जाता।'
                  : 'Your privacy is protected. No documents are shared without consent.'}
              </span>
            </div>
          </div>

          {/* Emergency & Official Helplines */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">
              {language === 'hi' ? 'महत्वपूर्ण हेल्पलाइन' : 'Official Helplines'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-red-400" />
                <span className="font-semibold text-white">1930</span>
                <span className="text-xs text-slate-400">
                  ({language === 'hi' ? 'साइबर वित्तीय धोखाधड़ी' : 'Cyber Financial Fraud'})
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-blue-400" />
                <span className="font-semibold text-white">14443</span>
                <span className="text-xs text-slate-400">
                  ({language === 'hi' ? 'राष्ट्रीय उपभोक्ता हेल्पलाइन' : 'National Consumer Helpline'})
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-amber-400" />
                <span className="font-semibold text-white">14567</span>
                <span className="text-xs text-slate-400">
                  ({language === 'hi' ? 'एल्डर लाइन / वरिष्ठ नागरिक' : 'Elder Line Help'})
                </span>
              </li>
            </ul>
          </div>

          {/* Quick Govt Links */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">
              {language === 'hi' ? 'सरकारी पोर्टल' : 'Official Portals'}
            </h4>
            <ul className="space-y-1.5 text-sm">
              <li>
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1"
                >
                  <span>National Cyber Crime Portal</span>
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a
                  href="https://sancharsaathi.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1"
                >
                  <span>Sanchar Saathi (संचार साथी)</span>
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a
                  href="https://services.india.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1"
                >
                  <span>National Government Services</span>
                  <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Digital Saathi. Built with pride for Digital India & Accessibility.</p>
          <p className="flex items-center gap-1">
            <span>Made with care for every citizen</span>
            <Heart size={14} className="text-red-500 fill-red-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
};
