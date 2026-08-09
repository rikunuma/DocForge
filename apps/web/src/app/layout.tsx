import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';
import AuthGuard from '@/components/AuthGuard';

export const metadata: Metadata = {
  title: 'DocForge - リアルタイム帳票作成プラットフォーム',
  description: 'マルチテナント対応・完全埋め込み日本語PDF高精度出力エンジン',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Navigation />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AuthGuard>
            {children}
          </AuthGuard>
        </main>
        <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-400 bg-slate-950/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 space-y-2">
            <p className="font-medium text-slate-300">
              DocForge Multi-Tenant Platform &copy; 2026
            </p>
            <p className="text-[11px] text-slate-400 max-w-2xl mx-auto leading-relaxed">
              【免責事項】当システムで生成される帳票フォーマットは汎用的なテンプレートです。各法規制や税制要件への適否はお客様の責任にてご確認ください。
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
