import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, FileText, Server, Sparkles, Terminal, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* ナビゲーションバー */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            D
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
            DocForge
          </span>
          <Badge variant="outline" className="ml-2 border-indigo-500/30 text-indigo-400 bg-indigo-500/10">
            v0.1.0
          </Badge>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400 font-medium">
          <a href="#features" className="hover:text-indigo-400 transition-colors">機能</a>
          <a href="#architecture" className="hover:text-indigo-400 transition-colors">アーキテクチャ</a>
          <a href="#status" className="hover:text-indigo-400 transition-colors">ステータス</a>
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-slate-700 hover:bg-slate-800 text-slate-300">
            ドキュメント
          </Button>
          <Button className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-medium shadow-md shadow-indigo-500/25">
            ダッシュボード <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-16 flex flex-col gap-16">
        {/* ヒーローセクション */}
        <section className="flex flex-col items-center text-center gap-6 pt-8 pb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Next.js 15 & Shadcn/ui 環境構築完了
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl leading-tight">
            次世代のドキュメント生成 & <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">
              API プラットフォーム
            </span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed">
            DocForge は FastAPI / PostgreSQL の堅牢なバックエンドと Next.js / Shadcn/ui のモダンなフロントエンドを統合したフルスタックプラットフォームです。
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 shadow-lg shadow-indigo-600/30">
              プロジェクトを開始する
            </Button>
            <Button size="lg" variant="outline" className="border-slate-700 hover:bg-slate-900 text-slate-300 px-8">
              <Terminal className="mr-2 h-4 w-4" /> 開発ログを確認
            </Button>
          </div>
        </section>

        {/* コンポーネント & アーキテクチャカード */}
        <section id="architecture" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-sm hover:border-indigo-500/40 transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="h-10 w-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2">
                <FileText className="h-5 w-5" />
              </div>
              <CardTitle className="text-white text-xl">apps/web</CardTitle>
              <CardDescription className="text-slate-400">
                Next.js (App Router) + Tailwind CSS + Shadcn/ui
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>React 19 & TypeScript サポート</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Shadcn/ui デザインシステム組込</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-sm hover:border-indigo-500/40 transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-2">
                <Server className="h-5 w-5" />
              </div>
              <CardTitle className="text-white text-xl">apps/api</CardTitle>
              <CardDescription className="text-slate-400">
                FastAPI + Python 3.11 + Uvicorn
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                <span>高速 OpenAPI 自動ドキュメント</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                <span>SQLAlchemy & Pydantic 連携</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-sm hover:border-indigo-500/40 transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                <Database className="h-5 w-5" />
              </div>
              <CardTitle className="text-white text-xl">PostgreSQL</CardTitle>
              <CardDescription className="text-slate-400">
                Docker コンテナベース永続DB
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>ヘルスチェック & 自動リトライ</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Volume 永続データ保持</span>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t border-slate-800 py-8 px-6 text-center text-xs text-slate-500">
        © 2026 DocForge. All rights reserved.
      </footer>
    </div>
  );
}
