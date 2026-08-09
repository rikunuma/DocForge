'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  FileEdit, 
  FolderKanban, 
  Palette, 
  Sparkles,
  Building2,
  Users,
  LogOut,
  LogIn,
  ChevronDown,
  Menu,
  X,
  Settings,
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import { getStoredUser, removeAuthToken, User } from '@/lib/api';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentUser(getStoredUser());
    setIsMobileMenuOpen(false);
    setIsAdminDropdownOpen(false);
  }, [pathname]);

  // クリックアウトサイドでドロップダウン閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAdminDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    removeAuthToken();
    setCurrentUser(null);
    router.push('/login');
  };

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const isTenantAdmin = currentUser?.role === 'TENANT_ADMIN' || isSuperAdmin;

  // 一般向けメインメニュー
  const mainNavItems = [
    { name: 'ホーム', href: '/', icon: Home },
    { name: '帳票エディタ', href: '/editor', icon: FileEdit },
    { name: '作成済み帳票', href: '/documents', icon: FolderKanban },
    { name: 'デザイン管理', href: '/templates', icon: Palette },
  ];

  // 管理者メニュー
  const adminNavItems = [
    ...(isSuperAdmin ? [{ name: '契約テナント管理', href: '/tenants', icon: Building2 }] : []),
    ...(isTenantAdmin ? [{ name: isSuperAdmin ? '全ユーザー管理' : '自社ユーザー管理', href: '/users', icon: Users }] : []),
  ];

  if (pathname === '/login') {
    return (
      <header className="sticky top-0 z-50 bg-slate-950/90 border-b border-slate-800 shadow-md backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white">DocForge</span>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 border-b border-slate-800 shadow-md backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ブランドロゴ */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-300 bg-clip-text text-transparent tracking-wide leading-none">
                DocForge
              </span>
              <span className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate max-w-[120px] sm:max-w-none">
                {isSuperAdmin ? '統括プラットフォーム' : (currentUser?.tenant?.name || '帳票スタジオ')}
              </span>
            </div>
          </Link>

          {/* デスクトップ ナビゲーション */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/30 text-blue-300 border border-blue-500/40 shadow-sm shadow-blue-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* 管理者用 ドロップダウン メニュー */}
            {adminNavItems.length > 0 && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    pathname.startsWith('/tenants') || pathname.startsWith('/users')
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Settings className="w-4 h-4 text-purple-400" />
                  <span>システム管理</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isAdminDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isAdminDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 z-50 animate-fade-in">
                    {adminNavItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <Icon className="w-4 h-4 text-purple-400" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* ユーザープロファイル & ログアウト */}
          <div className="hidden md:flex items-center gap-3 shrink-0 pl-2 border-l border-slate-800">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-bold text-white leading-tight flex items-center justify-end gap-1">
                    <span>{currentUser.full_name}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                      isSuperAdmin ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {isSuperAdmin ? '統括' : (currentUser.role === 'TENANT_ADMIN' ? '管理者' : '一般')}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                    {currentUser.email}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-colors"
                  title="ログアウト"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
              >
                <LogIn className="w-4 h-4" />
                <span>ログイン</span>
              </Link>
            )}
          </div>

          {/* モバイルハンバーガーボタン */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* モバイルドロワーメニュー */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900/95 border-b border-slate-800 px-4 py-4 space-y-3 backdrop-blur-xl">
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800"
                >
                  <Icon className="w-4 h-4 text-blue-400" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {adminNavItems.length > 0 && (
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <span className="px-3 text-[10px] font-semibold text-purple-400 tracking-wider uppercase">システム管理</span>
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-purple-300 hover:bg-slate-800"
                  >
                    <Icon className="w-4 h-4 text-purple-400" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {currentUser && (
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">{currentUser.full_name}</div>
                <div className="text-[10px] text-slate-400">{currentUser.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 text-xs font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>ログアウト</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
