'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck, Building2, KeyRound, UserCheck, ShieldAlert } from 'lucide-react';
import { login } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'ログインに失敗しました。メールアドレスとパスワードを確認してください。');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (type: 'super' | 'admin' | 'user') => {
    if (type === 'super') {
      setEmail('superadmin@docforge.com');
      setPassword('superadmin123');
    } else if (type === 'admin') {
      setEmail('tenantadmin@docforge.com');
      setPassword('admin123');
    } else {
      setEmail('user@docforge.com');
      setPassword('user123');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-glass p-8 sm:p-10 rounded-3xl border border-slate-700/80 shadow-2xl relative overflow-hidden">
        {/* 背景グロー */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-blue-500/20 mb-2">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            DocForge 認証ログイン
          </h2>
          <p className="text-xs text-slate-400">
            マルチテナント帳票プラットフォーム (ログイン必須)
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              メールアドレス
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              パスワード
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? '認証処理中...' : 'ログインする'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* ロール別デモ入力ボタン群 */}
        <div className="pt-5 border-t border-slate-800 text-center space-y-3 relative z-10">
          <p className="text-[11px] font-semibold text-slate-400">ロール別デモログインの自動入力</p>
          <div className="grid grid-cols-1 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoFill('super')}
              className="w-full py-2 px-3 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/30 text-purple-200 font-medium flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>プラットフォーム管理者</span>
              </div>
              <span className="text-[10px] font-mono text-purple-300">superadmin@docforge.com</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoFill('admin')}
              className="w-full py-2 px-3 rounded-xl bg-blue-950/60 hover:bg-blue-900/80 border border-blue-500/30 text-blue-200 font-medium flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>テナント管理者</span>
              </div>
              <span className="text-[10px] font-mono text-blue-300">tenantadmin@docforge.com</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoFill('user')}
              className="w-full py-2 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-slate-400" />
                <span>一般ユーザー</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">user@docforge.com</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
