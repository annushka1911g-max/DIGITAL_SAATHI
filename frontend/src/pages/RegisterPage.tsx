import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const RegisterPage: React.FC = () => {
  const { language } = useAccessibility();
  const { login } = useAuth();
  const navigate = useNavigate();
  const isHi = language === 'hi';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredLang, setPreferredLang] = useState<'hi' | 'en'>(language);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.register({
        email,
        password,
        full_name: fullName,
        preferred_language: preferredLang,
      });

      const data = await api.login({ email, password });
      const userRes = await api.getCurrentUser();
      login(data.access_token, userRes as any);
      navigate('/');
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(
        isHi
          ? `पंजीकरण विफल: ${err.message}`
          : `Registration failed: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#0F2C59] text-amber-400 font-black text-xl flex items-center justify-center mx-auto shadow-md">
            DS
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isHi ? 'नया खाता बनाएं' : 'Create an Account'}
          </h1>
          <p className="text-xs text-slate-500">
            {isHi ? 'डिजिटल साथी के साथ सुरक्षित अनुभव पाएं' : 'Get a personalized and secure experience'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {isHi ? 'पूरा नाम' : 'Full Name'}
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={isHi ? 'उदा. राजेश शर्मा' : 'e.g. Rajesh Sharma'}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2C59]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {isHi ? 'ईमेल पता' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2C59]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {isHi ? 'पासवर्ड (कम से कम 8 अक्षर)' : 'Password (min. 8 chars)'}
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2C59]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {isHi ? 'पसंदीदा भाषा' : 'Preferred Language'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPreferredLang('hi')}
                className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                  preferredLang === 'hi'
                    ? 'bg-[#0F2C59] text-white border-[#0F2C59]'
                    : 'border-slate-300 dark:border-slate-700'
                }`}
              >
                हिंदी (Hindi)
              </button>
              <button
                type="button"
                onClick={() => setPreferredLang('en')}
                className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                  preferredLang === 'en'
                    ? 'bg-[#0F2C59] text-white border-[#0F2C59]'
                    : 'border-slate-300 dark:border-slate-700'
                }`}
              >
                English
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#0F2C59] hover:bg-[#1E4E8C] text-white font-bold py-3 rounded-xl shadow-md transition-colors text-sm"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <span>{isHi ? 'रजिस्टर करें' : 'Create Account'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          {isHi ? 'पहले से खाता है?' : 'Already have an account?'}{' '}
          <Link to="/login" className="text-[#0F2C59] dark:text-blue-400 font-bold hover:underline">
            {isHi ? 'लॉगिन करें' : 'Sign In'}
          </Link>
        </p>
      </div>
    </div>
  );
};
