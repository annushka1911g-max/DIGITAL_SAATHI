import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const LoginPage: React.FC = () => {
  const { language } = useAccessibility();
  const { login } = useAuth();
  const navigate = useNavigate();
  const isHi = language === 'hi';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await api.login({ email, password });
      const userRes = await api.getCurrentUser();
      login(data.access_token, userRes as any);
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        isHi
          ? 'ईमेल या पासवर्ड गलत है। कृपया पुनः जांचें।'
          : 'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGuestDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.login({ email: 'testuser@digitalsaathi.in', password: 'Password123!' });
      const userRes = await api.getCurrentUser();
      login(data.access_token, userRes as any);
      navigate('/');
    } catch {
      try {
        await api.register({
          email: 'testuser@digitalsaathi.in',
          password: 'Password123!',
          full_name: 'राम कुमार (Ramesh Kumar)',
          preferred_language: 'hi',
        });
        const data = await api.login({ email: 'testuser@digitalsaathi.in', password: 'Password123!' });
        const userRes = await api.getCurrentUser();
        login(data.access_token, userRes as any);
        navigate('/');
      } catch (regErr: any) {
        setError(regErr.message || 'Demo login failed');
      }
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
            {isHi ? 'डिजिटल साथी में लॉगिन करें' : 'Sign In to Digital Saathi'}
          </h1>
          <p className="text-xs text-slate-500">
            {isHi ? 'अपनी सुरक्षित प्रोफ़ाइल व सहेजे गए दस्तावेज़ देखें' : 'Access your saved documents and history'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleGuestDemoLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold py-3 rounded-xl shadow transition-colors text-sm"
        >
          <Sparkles size={18} />
          <span>{isHi ? 'एक-क्लिक डेमो लॉगिन (तुरंत टेस्ट करें)' : 'One-Click Demo Login (Instant Access)'}</span>
        </button>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
          <span className="flex-shrink mx-4 text-xs text-slate-400 uppercase font-semibold">
            {isHi ? 'या ईमेल से लॉगिन करें' : 'Or via credentials'}
          </span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {isHi ? 'ईमेल पता' : 'Email Address'}
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
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
              {isHi ? 'पासवर्ड' : 'Password'}
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2C59]"
              />
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
                <span>{isHi ? 'लॉगिन करें' : 'Sign In'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          {isHi ? 'खाता नहीं है?' : "Don't have an account?"}{' '}
          <Link to="/register" className="text-[#0F2C59] dark:text-blue-400 font-bold hover:underline">
            {isHi ? 'नया खाता बनाएं' : 'Register here'}
          </Link>
        </p>
      </div>
    </div>
  );
};
