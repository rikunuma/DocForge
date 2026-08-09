'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getAuthToken, fetchMe, removeAuthToken, User } from '@/lib/api';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ログイン画面はガード対象外
    if (pathname === '/login') {
      setAuthorized(true);
      setLoading(false);
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setAuthorized(false);
      setLoading(false);
      router.push('/login');
      return;
    }

    // 最新ユーザー情報の検証
    fetchMe()
      .then((user) => {
        setAuthorized(true);
      })
      .catch((err) => {
        console.warn('認証トークン検証失敗:', err);
        removeAuthToken();
        setAuthorized(false);
        router.push('/login');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [pathname, router]);

  if (pathname === '/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-400">ログイン認証を確認中...</p>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
