'use client';

import { useEffect, useState, use } from 'react';
import { fetchDocumentById, DocumentConfig } from '@/lib/api';
import LiveEditor from '@/components/LiveEditor';

export default function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const docId = Number(resolvedParams.id);

  const [documentConfig, setDocumentConfig] = useState<DocumentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!docId) return;
    fetchDocumentById(docId)
      .then((data) => setDocumentConfig(data))
      .catch((err) => setError(err.message || '書類の取得に失敗しました'))
      .finally(() => setLoading(false));
  }, [docId]);

  if (loading) {
    return (
      <div className="p-12 text-center rounded-2xl bg-glass border border-slate-800">
        <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 text-sm font-medium">書類データを読み込み中...</p>
      </div>
    );
  }

  if (error || !documentConfig) {
    return (
      <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
        {error || '対象の書類が見つかりませんでした'}
      </div>
    );
  }

  return <LiveEditor initialData={documentConfig} isEdit={true} />;
}
