'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  FileEdit, 
  FolderKanban, 
  Palette, 
  ArrowRight, 
  Plus, 
  Download, 
  Eye, 
  Layers, 
  Sparkles,
  RefreshCw,
  Copy,
  FileCheck2,
  Receipt,
  FileText,
  PackageCheck
} from 'lucide-react';
import { fetchTemplates, fetchDocuments, Template, DocumentConfig, getPdfUrl } from '@/lib/api';

export default function Home() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [documents, setDocuments] = useState<DocumentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tData, dData] = await Promise.all([fetchTemplates(), fetchDocuments()]);
      setTemplates(tData);
      setDocuments(dData);
    } catch (err: any) {
      setError(err.message || 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-10">
      {/* ヒーローバナー */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-12 border border-indigo-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DocForge リアルタイム帳票エンジン</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            見たまま編集・即時プレビューで<br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">プロ品質の書類</span> を10秒で作成
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            請求書・見積書・発注書を直感的なリアルタイムライブエディタで簡単作成。カラーやサイズのカスタマイズ、ワンクリックでのPDFダウンロードや過去書類の複製機能を提供します。
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/editor"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>新しい書類を作成する</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 🚀 ワンクリック・クイックスタートカード */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <span>クイックスタート（ワンクリックで作成開始）</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 請求書 */}
          <Link
            href="/editor"
            className="group relative rounded-2xl bg-glass p-6 border border-slate-800 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors flex items-center gap-1.5">
                  請求書を作成
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  標準的な請求書テンプレートでライブエディタを開きます。
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/60 text-xs text-blue-400 font-semibold flex items-center justify-end">
              エディタを開く &rarr;
            </div>
          </Link>

          {/* 見積書 */}
          <Link
            href="/editor"
            className="group relative rounded-2xl bg-glass p-6 border border-slate-800 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  見積書を作成
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  新規提案や概算見積もりに適したテンプレートで作成を開始します。
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/60 text-xs text-amber-400 font-semibold flex items-center justify-end">
              エディタを開く &rarr;
            </div>
          </Link>

          {/* 発注書 */}
          <Link
            href="/editor"
            className="group relative rounded-2xl bg-glass p-6 border border-slate-800 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <PackageCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                  発注書を作成
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  資材や発注案件用フォーマットで即座に作成を開始します。
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/60 text-xs text-emerald-400 font-semibold flex items-center justify-end">
              エディタを開く &rarr;
            </div>
          </Link>
        </div>
      </div>

      {/* 📂 最近作成した書類（クイックアクセス & PDF出力） */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderKanban className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">作成・保存済みの書類</h2>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={loadData}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="更新"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link 
              href="/documents"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              すべて表示 &rarr;
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center rounded-2xl bg-glass border border-slate-800">
            <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-400 text-sm">保存データを読み込み中...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            {error}
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-glass border border-slate-800 space-y-4">
            <p className="text-slate-400 text-sm">まだ保存されている書類がありません。</p>
            <Link 
              href="/editor"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              書類を作成してみる
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.slice(0, 4).map((doc) => {
              const pdfUrl = getPdfUrl(doc.id);
              const items = doc.items || [];
              const subtotal = items.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unit_price) || 0), 0);

              return (
                <div 
                  key={doc.id}
                  className="rounded-2xl bg-glass p-5 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {doc.template?.name || 'テンプレート'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{doc.doc_number}</span>
                    </div>

                    <h3 className="font-bold text-lg text-white">
                      {doc.title}
                    </h3>
                    
                    <div className="text-xs text-slate-400 space-y-1">
                      <p>宛先: <span className="text-slate-200">{doc.recipient_info?.company_name || '未設定'} {doc.recipient_info?.honorific || ''}</span></p>
                      <p>発行日: <span className="text-slate-200">{doc.issue_date}</span></p>
                      <p>概算合計: <span className="text-indigo-300 font-mono font-bold">¥{Math.round(subtotal * 1.1).toLocaleString()}</span></p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <Link
                      href={`/documents/${doc.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                    >
                      <FileEdit className="w-3.5 h-3.5 text-blue-400" />
                      <span>編集する</span>
                    </Link>

                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-sm shadow-indigo-600/30"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDFダウンロード</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
