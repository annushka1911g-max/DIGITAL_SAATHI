import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Mic,
  ShieldAlert,
  FileText,
  FileQuestion,
  Home,
  PhoneCall,
  Languages,
  Type,
  Menu,
  X,
  User as UserIcon,
  LogOut,
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { language, setLanguage, cycleFontSize, fontSize } = useAccessibility();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    {
      to: '/',
      labelHi: 'मुख्य पृष्ठ',
      labelEn: 'Home',
      icon: Home,
    },
    {
      to: '/assistant',
      labelHi: 'वॉइस साथी',
      labelEn: 'Voice Saathi',
      icon: Mic,
    },
    {
      to: '/scams',
      labelHi: 'स्कैम साथी',
      labelEn: 'Scam Saathi',
      icon: ShieldAlert,
    },
    {
      to: '/documents',
      labelHi: 'दस्तावेज़ साथी',
      labelEn: 'Document Saathi',
      icon: FileText,
    },
    {
      to: '/forms',
      labelHi: 'फॉर्म साथी',
      labelEn: 'Form Saathi',
      icon: FileQuestion,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full shadow-md">
      {/* Emergency Cybercrime Helpline Banner */}
      <div className="bg-red-700 text-white px-4 py-1.5 text-xs sm:text-sm font-semibold flex items-center justify-between">
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <PhoneCall size={16} className="animate-bounce" />
          <span>
            {language === 'hi'
              ? 'वित्तीय धोखाधड़ी या साइबर फ्रॉड होने पर तुरंत 1930 पर कॉल करें'
              : 'Immediate Financial Cybercrime / Fraud Helpline: Call 1930'}
          </span>
        </div>
        <a
          href="https://cybercrime.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-block underline hover:text-red-200 text-xs ml-4"
        >
          cybercrime.gov.in ↗
        </a>
      </div>

      {/* Main Navigation Bar */}
      <nav className="bg-[#0F2C59] text-white border-b border-blue-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo & Tagline */}
            <Link to="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-white rounded-lg p-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-[#0F2C59] font-black text-xl shadow-lg group-hover:scale-105 transition-transform">
                DS
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xl font-extrabold tracking-tight flex items-center gap-1.5">
                  डिजिटल साथी <span className="text-xs bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded font-bold">AI</span>
                </span>
                <span className="text-xs text-blue-200 font-medium hidden sm:block">
                  {language === 'hi' ? 'आपकी भाषा, आपकी आवाज़, आपका डिजिटल साथी' : 'Voice-First Digital Accessibility & Safety'}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-[#1E4E8C] text-white shadow-inner'
                        : 'text-blue-100 hover:bg-[#1E4E8C]/60 hover:text-white'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{language === 'hi' ? item.labelHi : item.labelEn}</span>
                  </Link>
                );
              })}
            </div>

            {/* Quick Accessibility Controls & Auth */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Language Switch */}
              <button
                type="button"
                onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
                className="flex items-center gap-1.5 bg-blue-900/60 hover:bg-blue-800 text-xs font-semibold px-3 py-1.5 rounded-lg border border-blue-400/30 transition-colors"
                title="Change language"
              >
                <Languages size={15} />
                <span>{language === 'hi' ? 'English' : 'हिंदी'}</span>
              </button>

              {/* Font Size Toggle */}
              <button
                type="button"
                onClick={cycleFontSize}
                className="flex items-center gap-1 bg-blue-900/60 hover:bg-blue-800 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-blue-400/30 transition-colors"
                title="Cycle text size"
              >
                <Type size={15} />
                <span>
                  {fontSize === 'normal' ? 'A' : fontSize === 'large' ? 'A+' : 'A++'}
                </span>
              </button>

              {/* User Auth Info */}
              {user ? (
                <div className="flex items-center gap-2 pl-2 border-l border-blue-800">
                  <div className="text-right">
                    <p className="text-xs font-bold leading-tight">{user.full_name}</p>
                    <p className="text-[10px] text-blue-200">{user.email}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="p-1.5 rounded-lg hover:bg-blue-800 text-blue-200 hover:text-white"
                    title={language === 'hi' ? 'लॉगआउट करें' : 'Logout'}
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-3 py-2 rounded-lg transition-colors shadow"
                >
                  <UserIcon size={15} />
                  <span>{language === 'hi' ? 'लॉगिन' : 'Login'}</span>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                type="button"
                onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
                className="bg-blue-900/60 text-xs font-bold px-2 py-1 rounded border border-blue-400/30"
              >
                {language === 'hi' ? 'EN' : 'हिं'}
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-blue-200 hover:text-white hover:bg-blue-800 focus:outline-none"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0A1E3D] px-4 pt-2 pb-4 space-y-2 border-t border-blue-900">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                    isActive ? 'bg-[#1E4E8C] text-white' : 'text-blue-100 hover:bg-blue-900'
                  }`}
                >
                  <Icon size={20} />
                  <span>{language === 'hi' ? item.labelHi : item.labelEn}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-blue-800 flex items-center justify-between">
              {user ? (
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-medium">{user.full_name}</span>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs bg-red-600/80 px-2.5 py-1.5 rounded"
                  >
                    {language === 'hi' ? 'लॉगआउट' : 'Logout'}
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 bg-amber-400 text-slate-950 font-bold rounded-lg text-sm"
                >
                  {language === 'hi' ? 'लॉगिन / साइन-अप' : 'Login / Sign Up'}
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
