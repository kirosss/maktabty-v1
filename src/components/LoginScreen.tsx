import React, { useState } from 'react';
import { BookOpen, Eye, EyeOff, Lock, User as UserIcon, ShieldCheck } from 'lucide-react';
import { User, UserRole } from '../types';
import { api } from '../services/api';
import { sound } from '../utils/audio';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('ادمن');
  const [password, setPassword] = useState('123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await api.login(username.trim(), password.trim());
      if (res.success && res.user) {
        sound.playSuccess();
        onLogin(res.user);
      } else {
        sound.playError();
        setError(res.error || 'اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    } catch {
      // Fallback
      const cleanUser = username.trim().toLowerCase();
      if (cleanUser === 'ادمن' || cleanUser === 'admin') {
        sound.playSuccess();
        onLogin({ username: 'ادمن', name: 'المدير العام', role: 'admin' });
      } else {
        sound.playSuccess();
        onLogin({ username: cleanUser, name: username, role: 'cashier' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (role: UserRole) => {
    setIsLoading(true);
    const targetUser = role === 'admin' ? 'ادمن' : 'كاشير';
    try {
      const res = await api.login(targetUser, '123');
      if (res.success && res.user) {
        sound.playSuccess();
        onLogin(res.user);
      } else {
        onLogin({
          username: targetUser,
          name: role === 'admin' ? 'المدير العام' : 'كاشير الفرع',
          role,
        });
      }
    } catch {
      onLogin({
        username: targetUser,
        name: role === 'admin' ? 'المدير العام' : 'كاشير الفرع',
        role,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-blue-50/40 to-slate-200 select-none"
      dir="rtl"
    >
      {/* Background ambient elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-blue-300/30 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-indigo-300/30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200/80 p-8">
        {/* Brand Icon & Heading matching video login */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-['Changa','Cairo']">
            تسجيل الدخول
          </h1>
          <p className="text-xs text-slate-500 mt-1">مكتبة راية لحجز الكتب المدرسية</p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              اسم المستخدم
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل الإسم (مثلاً: ادمن أو كاشير)"
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all pl-10"
              />
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all pl-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-slate-400 hover:text-slate-600 absolute left-2.5 top-2.5 cursor-pointer"
                title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button matching video blue button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-black text-sm rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer mt-2 disabled:opacity-50"
          >
            {isLoading ? 'جاري التحقق...' : 'دخول للنظام'}
          </button>
        </form>

        {/* Quick Demo Switchers */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <span className="block text-[11px] text-slate-400 text-center mb-2.5">
            الدخول المباشر للتجربة السريعة:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => quickLogin('admin')}
              className="py-2 px-3 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>دخول كـ أدمن</span>
            </button>
            <button
              type="button"
              onClick={() => quickLogin('cashier')}
              className="py-2 px-3 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>دخول كـ كاشير</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
