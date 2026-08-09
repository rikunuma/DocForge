'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';


import { 
  Printer, 
  Download, 
  Eye, 
  Edit3, 
  FileText, 
  FileCheck2, 
  Sparkles, 
  Layers,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { fetchDocuments, fetchDocumentById, DocumentConfig, getPdfUrl } from '@/lib/api';

function OutputContent() {
  const searchParams = useSearchParams();
  const initialDocId = searchParams.get('docId');

  const [documents, setDocuments] = useState<DocumentConfig[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(initialDocId ? Number(initialDocId) : null);
  const [currentDoc, setCurrentDoc] = useState<DocumentConfig | null>(null);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [pdfVersion, setPdfVersion] = useState(1);

  useEffect(() => {
    fetchDocuments()
      .then((data) => {
        setDocuments(data);
        if (data.length > 0) {
          if (!selectedDocId || !data.find(d => d.id === selectedDocId)) {
            setSelectedDocId(data[0].id);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingDocs(false));
  }, []);

  useEffect(() => {
    if (!selectedDocId) {
      setCurrentDoc(null);
      return;
    }
    const found = documents.find(d => d.id === selectedDocId);
    if (found) {
      setCurrentDoc(found);
    } else {
      fetchDocumentById(selectedDocId)
        .then(data => setCurrentDoc(data))
        .catch(err => console.error(err));
    }
    setPdfVersion(v => v + 1);
  }, [selectedDocId, documents]);

  const pdfUrl = selectedDocId ? `${getPdfUrl(selectedDocId)}?v=${pdfVersion}` : null;

  return (
    <div className="space-y-8">
      {/* ページヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-sm font-semibold mb-1">
            <Printer className="w-4 h-4" />
            <span>PDF生成・インラインビューア</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">帳票出力・PDFプレビュー機能</h1>
          <p className="text-slate-400 text-sm mt-1">
            選択した帳票テンプレートと文言設定を合成し、ベクターPDFをダイナミック生成・印刷します。
          </p>
        </div>

        {selectedDocId && pdfUrl && (
          <div className="flex items-center gap-3">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition-all shadow-lg shadow-purple-600/30"
            >
              <Download className="w-4 h-4" />
              <span>PDFをダウンロード</span>
            </a>
          </div>
        )}
      </div>

      {/* メインレイアウト: 左側 帳票選択＆情報 / 右側 PDFプレビュー */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 左カラム: 帳票設定選択・スペック表示 (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* 帳票文言設定セレクター */}
          <div className="rounded-2xl bg-glass p-6 border border-slate-800 space-y-4">
            <h2 className="text-sm font-semibold text-purple-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4" /> 出力対象の帳票を選択
            </h2>

            {loadingDocs ? (
              <div className="text-xs text-slate-400 py-2">帳票一覧を読み込み中...</div>
            ) : documents.length === 0 ? (
              <div className="text-xs text-slate-400 py-2 space-y-2">
                <p>出力できる帳票設定がまだありません。</p>
                <Link
                  href="/documents/new"
                  className="inline-block text-blue-400 hover:underline"
                >
                  先に文言設定を作成してください
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => {
                  const isSelected = doc.id === selectedDocId;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-purple-500/60 shadow-md shadow-purple-500/10'
                          : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          {doc.template?.name || 'テンプレート'}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">{doc.doc_number}</span>
                      </div>
                      <h3 className="font-bold text-sm text-white mt-2 flex items-center justify-between">
                        <span>{doc.title}</span>
                        {isSelected && <ChevronRight className="w-4 h-4 text-purple-400" />}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        宛先: {doc.recipient_info?.company_name || '未設定'} {doc.recipient_info?.honorific || ''}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 選択中帳票のデータ詳細・編集案内 */}
          {currentDoc && (
            <div className="rounded-2xl bg-glass p-6 border border-slate-800 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-semibold text-slate-300">帳票構成情報</span>
                <Link
                  href={`/documents/${currentDoc.id}`}
                  className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>文言を編集する</span>
                </Link>
              </div>

              <div className="space-y-2 text-slate-400">
                <p>
                  表題: <span className="text-slate-200 font-semibold">{currentDoc.title}</span>
                </p>
                <p>
                  帳票番号: <span className="text-slate-200 font-mono">{currentDoc.doc_number}</span>
                </p>
                <p>
                  発行日: <span className="text-slate-200">{currentDoc.issue_date}</span>
                </p>
                <p>
                  用紙規格: <span className="text-slate-200">{currentDoc.template?.paper_size || 'A4'} ({currentDoc.template?.orientation === 'landscape' ? '横' : '縦'})</span>
                </p>
                <p>
                  余白設定: <span className="text-slate-200">上下左右 {currentDoc.template?.margin_top_mm}mm</span>
                </p>
                <p>
                  明細行数: <span className="text-slate-200 font-semibold">{currentDoc.items?.length || 0} 行</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 右カラム: PDF インラインビューア (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl bg-glass p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Eye className="w-5 h-5 text-purple-400" />
              <span>PDF リアルタイムプレビュー</span>
            </div>

            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>別タブで開く</span>
              </a>
            )}
          </div>

          {pdfUrl ? (
            <div className="relative w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-inner h-[720px]">
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title="帳票PDFプレビュー"
              />
            </div>
          ) : (
            <div className="h-[500px] flex flex-col items-center justify-center rounded-xl bg-slate-900/50 border border-dashed border-slate-800 text-slate-500 space-y-2">
              <Printer className="w-12 h-12 text-slate-600 animate-bounce" />
              <p className="text-sm">表示する帳票を選択してください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OutputPage() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center rounded-2xl bg-glass border border-slate-800">
        <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 text-sm font-medium">出力モジュールを初期化中...</p>
      </div>
    }>
      <OutputContent />
    </Suspense>
  );
}
