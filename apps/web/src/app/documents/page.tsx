'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  FolderKanban, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Download, 
  FileEdit,
  Sparkles,
  FileText
} from 'lucide-react';
import { fetchDocuments, deleteDocument, DocumentConfig, getPdfUrl } from '@/lib/api';
import ConfirmModal from '@/components/ConfirmModal';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 削除モーダルステート
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadDocs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDocuments();
      setDocuments(data);
    } catch (err: any) {
      setError(err.message || '書類一覧の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const openDeleteModal = (id: number) => {
    setDeleteTargetId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      await deleteDocument(deleteTargetId);
      setDeleteTargetId(null);
      loadDocs();
    } catch (err: any) {
      alert(err.message || '削除に失敗しました');
    } finally {
      setDeleting(false);
    }
  };

  const targetDocument = documents.find(d => d.id === deleteTargetId);

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold mb-1">
            <FolderKanban className="w-4 h-4" />
            <span>書類データ管理</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">作成済み書類一覧</h1>
          <p className="text-slate-400 text-sm mt-1">
            作成・保存された過去の書類データの編集、プレビュー、PDFダウンロードが可能です。
          </p>
        </div>
        <Link
          href="/editor"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>新しい書類を作成</span>
        </Link>
      </div>

      {/* 一覧 */}
      {loading ? (
        <div className="p-12 text-center rounded-2xl bg-glass border border-slate-800">
          <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-400 text-sm">書類データを読み込み中...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          {error}
        </div>
      ) : documents.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-glass border border-slate-800 space-y-4">
          <p className="text-slate-400 text-sm">登録されている書類データがありません。</p>
          <Link
            href="/editor"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium"
          >
            書類を作成する
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documents.map((doc) => {
            const pdfUrl = getPdfUrl(doc.id);
            const items = doc.items || [];
            const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0), 0);

            return (
              <div 
                key={doc.id}
                className="rounded-2xl bg-glass p-6 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {doc.template?.name || '標準'}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{doc.doc_number}</span>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-white">{doc.title}</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      件名: {doc.custom_texts?.subject || '未設定'}
                    </p>
                  </div>

                  {/* 宛先・金額 */}
                  <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">宛先:</span>
                      <strong className="text-slate-200">{doc.recipient_info?.company_name || '未設定'} {doc.recipient_info?.honorific || ''}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">発行日:</span>
                      <span className="text-slate-300">{doc.issue_date}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                      <span className="text-slate-400">合計金額 (税込):</span>
                      <strong className="text-indigo-400 font-mono text-sm">¥{Math.round(subtotal * 1.1).toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => openDeleteModal(doc.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="書類を削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/documents/${doc.id}`}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                    >
                      <FileEdit className="w-3.5 h-3.5 text-blue-400" />
                      <span>編集</span>
                    </Link>
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-sm shadow-indigo-600/30"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF出力</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* カスタム確認削除モーダル */}
      <ConfirmModal
        isOpen={deleteTargetId !== null}
        title="書類データの削除"
        message={`「${targetDocument?.title || 'この書類'} (${targetDocument?.doc_number || ''})」を本当に削除してもよろしいですか？この操作は取り消せません。`}
        confirmText="削除する"
        cancelText="キャンセル"
        variant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
