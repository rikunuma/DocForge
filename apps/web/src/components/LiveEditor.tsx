'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Download, 
  Save, 
  Copy, 
  Plus, 
  Trash2, 
  Eye, 
  Edit3, 
  FileText, 
  User, 
  Building, 
  ListOrdered, 
  Sparkles, 
  ArrowLeft,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  Template, 
  DocumentConfig, 
  DocumentItem, 
  createDocument, 
  updateDocument, 
  fetchTemplates,
  generatePdfPreviewBlob,
  getPdfUrl
} from '@/lib/api';

interface LiveEditorProps {
  initialData?: DocumentConfig;
  isEdit?: boolean;
}

export default function LiveEditor({ initialData, isEdit = false }: LiveEditorProps) {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // モバイル用アクティブタブ ('form' | 'preview')
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');

  // フォームステート
  const [templateId, setTemplateId] = useState<number>(initialData?.template_id || 0);
  const [title, setTitle] = useState<string>(initialData?.title || '御 請 求 書');
  const [docNumber, setDocNumber] = useState<string>(initialData?.doc_number || '');
  const [issueDate, setIssueDate] = useState<string>(initialData?.issue_date || '');
  const [dueDate, setDueDate] = useState<string>(initialData?.due_date || '');

  // 宛先情報
  const [recipient, setRecipient] = useState({
    company_name: initialData?.recipient_info?.company_name || '株式会社サンプル',
    department: initialData?.recipient_info?.department || '営業部',
    contact_person: initialData?.recipient_info?.contact_person || '山田 太郎',
    honorific: initialData?.recipient_info?.honorific || '御中',
  });

  // 発行元自社情報
  const [sender, setSender] = useState({
    company_name: initialData?.sender_info?.company_name || 'DocForge ソリューションズ株式会社',
    postal_code: initialData?.sender_info?.postal_code || '100-0005',
    address: initialData?.sender_info?.address || '東京都千代田区丸の内1-2-3 丸の内ビル 15F',
    tel: initialData?.sender_info?.tel || '03-1234-5678',
    email: initialData?.sender_info?.email || 'billing@docforge.example.com',
    registration_number: initialData?.sender_info?.registration_number || 'T1234567890123',
  });

  // 明細リスト
  const [items, setItems] = useState<DocumentItem[]>(
    initialData?.items && initialData.items.length > 0
      ? initialData.items
      : [
          { name: 'Web帳票作成システム 要件定義・画面設計', quantity: 1, unit: '式', unit_price: 350000, tax_rate: 10 },
          { name: 'リアルタイムPDFレンダリング機能 開発', quantity: 1, unit: '式', unit_price: 250000, tax_rate: 10 },
        ]
  );

  // カスタム文言
  const [customTexts, setCustomTexts] = useState({
    subject: initialData?.custom_texts?.subject || '2026年8月度 システム開発費用のご請求',
    notes: initialData?.custom_texts?.notes || '毎度格別のご愛顧を賜り厚く御礼申し上げます。下記の通りご請求申し上げます。',
    bank_info: initialData?.custom_texts?.bank_info || 'みずほ銀行 丸の内支店 (100)\n普通 1234567\nカ）ドックフォージ',
    payment_terms: initialData?.custom_texts?.payment_terms || '翌月末銀行振込（振込手数料は貴社負担）',
  });

  // PDF プレビュー Blob URL
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [savedDocumentId, setSavedDocumentId] = useState<number | null>(initialData?.id || null);

  // 初回マウント時の日付・番号自動割り当て (SSRハイドレーション安全)
  useEffect(() => {
    if (!docNumber && !initialData?.doc_number) {
      setDocNumber(`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    }
    if (!issueDate && !initialData?.issue_date) {
      setIssueDate(new Date().toISOString().split('T')[0]);
    }
  }, [initialData]);

  // テンプレート初期化
  useEffect(() => {
    fetchTemplates()
      .then((data) => {
        setTemplates(data);
        if (data.length > 0 && !templateId) {
          setTemplateId(data[0].id);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingTemplates(false));
  }, []);

  // リアルタイム PDF プレビュー自動更新 (Debounced)
  useEffect(() => {
    if (!templateId) return;

    const timer = setTimeout(async () => {
      setPreviewLoading(true);
      try {
        const payload: Partial<DocumentConfig> = {
          template_id: templateId,
          title,
          doc_number: docNumber,
          issue_date: issueDate,
          due_date: dueDate,
          recipient_info: recipient,
          sender_info: sender,
          items,
          custom_texts: customTexts,
          tax_rate_default: 10,
        };

        const url = await generatePdfPreviewBlob(payload);
        setPreviewBlobUrl((oldUrl) => {
          if (oldUrl) URL.revokeObjectURL(oldUrl);
          return url;
        });
      } catch (err) {
        console.error('PDF Preview Generation Error:', err);
      } finally {
        setPreviewLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [templateId, title, docNumber, issueDate, dueDate, recipient, sender, items, customTexts]);

  // 明細操作
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { name: '', quantity: 1, unit: '個', unit_price: 0, tax_rate: 10 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof DocumentItem, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  // 小計・消費税・合計のリアルタイム計算
  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0), 0);
  const totalTax = items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0) * ((Number(item.tax_rate) || 10) / 100), 0);
  const grandTotal = subtotal + totalTax;

  // 保存処理
  const handleSave = async () => {
    if (!templateId) {
      alert('テンプレートを選択してください');
      return;
    }

    setSaving(true);
    setSaveSuccess(false);
    try {
      const payload: Partial<DocumentConfig> = {
        template_id: templateId,
        title,
        doc_number: docNumber,
        issue_date: issueDate,
        due_date: dueDate,
        recipient_info: recipient,
        sender_info: sender,
        items,
        custom_texts: customTexts,
        status: 'completed',
      };

      let result: DocumentConfig;
      if (savedDocumentId) {
        result = await updateDocument(savedDocumentId, payload);
      } else {
        result = await createDocument(payload);
        setSavedDocumentId(result.id);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  // 複製（クローン）処理
  const handleDuplicate = () => {
    setSavedDocumentId(null);
    setDocNumber(`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setTitle(`${title} (コピー)`);
    setSaveSuccess(false);
    alert('現在のデータをもとに新しい帳票データとして複製しました。必要箇所を調整して保存してください。');
  };

  // 即時 PDF ダウンロード
  const handleDownloadPdf = () => {
    if (savedDocumentId) {
      window.open(getPdfUrl(savedDocumentId), '_blank');
    } else if (previewBlobUrl) {
      const a = document.createElement('a');
      a.href = previewBlobUrl;
      a.download = `${docNumber || 'document'}.pdf`;
      a.click();
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. トップ アクション＆ナビゲーションバー */}
      <div className="sticky top-16 z-40 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/documents')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="一覧へ戻る"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{savedDocumentId ? `書類編集: #${savedDocumentId}` : '新規書類作成'}</span>
              {saveSuccess && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-bounce">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 保存しました
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400 font-mono">{docNumber || '番号生成中...'}</p>
          </div>
        </div>

        {/* アクションボタン群 */}
        <div className="flex items-center gap-2 flex-wrap">
          {savedDocumentId && (
            <button
              type="button"
              onClick={handleDuplicate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              <Copy className="w-4 h-4 text-indigo-400" />
              <span>複製して作成</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? '保存中...' : 'データを保存'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30"
          >
            <Download className="w-4 h-4" />
            <span>PDFを出力</span>
          </button>
        </div>
      </div>

      {/* モバイル用タブ切り替え (レスポンシブ) */}
      <div className="flex lg:hidden rounded-xl bg-slate-900 p-1 border border-slate-800">
        <button
          onClick={() => setActiveTab('form')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'form' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>フォーム入力</span>
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'preview' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>ライブプレビュー</span>
        </button>
      </div>

      {/* 2. 左右分割 リアルタイムライブエディタ (Desktop: 2列 / Mobile: タブ切替) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 左カラム: 入力フォーム (7 cols) */}
        <div className={`lg:col-span-7 space-y-6 ${activeTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
          {/* テンプレート & 画面基本設定 */}
          <div className="rounded-2xl bg-glass p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
                <Sliders className="w-4 h-4" /> デザイン＆基本設定
              </span>
              <span className="text-xs text-slate-400">リアルタイム連動</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">デザイン規格</label>
                {loadingTemplates ? (
                  <div className="text-xs text-slate-500 py-1.5">読み込み中...</div>
                ) : (
                  <select
                    value={templateId}
                    onChange={(e) => setTemplateId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium focus:border-blue-500 focus:outline-none"
                  >
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">書類表題 *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">書類番号 *</label>
                <input
                  type="text"
                  required
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">発行日 *</label>
                <input
                  type="date"
                  required
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* 宛先 & 自社発行元 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 宛先 */}
            <div className="rounded-2xl bg-glass p-5 border border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <User className="w-4 h-4" /> 宛先情報 (取引先)
              </span>
              <div className="space-y-2">
                <input
                  type="text"
                  value={recipient.company_name}
                  onChange={(e) => setRecipient(p => ({ ...p, company_name: e.target.value }))}
                  placeholder="宛先 会社名 / 氏名 *"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={recipient.department}
                    onChange={(e) => setRecipient(p => ({ ...p, department: e.target.value }))}
                    placeholder="部署名"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                  <select
                    value={recipient.honorific}
                    onChange={(e) => setRecipient(p => ({ ...p, honorific: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  >
                    <option value="御中">御中</option>
                    <option value="様">様</option>
                    <option value="各位">各位</option>
                  </select>
                </div>
                <input
                  type="text"
                  value={recipient.contact_person}
                  onChange={(e) => setRecipient(p => ({ ...p, contact_person: e.target.value }))}
                  placeholder="ご担当者名"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>
            </div>

            {/* 発行元 */}
            <div className="rounded-2xl bg-glass p-5 border border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-purple-400 flex items-center gap-1.5">
                <Building className="w-4 h-4" /> 発行元情報 (自社)
              </span>
              <div className="space-y-2">
                <input
                  type="text"
                  value={sender.company_name}
                  onChange={(e) => setSender(p => ({ ...p, company_name: e.target.value }))}
                  placeholder="自社 会社名 *"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={sender.postal_code}
                    onChange={(e) => setSender(p => ({ ...p, postal_code: e.target.value }))}
                    placeholder="〒 100-0005"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                  />
                  <input
                    type="text"
                    value={sender.tel}
                    onChange={(e) => setSender(p => ({ ...p, tel: e.target.value }))}
                    placeholder="TEL: 03-1234-5678"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                  />
                </div>
                <input
                  type="text"
                  value={sender.address}
                  onChange={(e) => setSender(p => ({ ...p, address: e.target.value }))}
                  placeholder="住所"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
                <input
                  type="text"
                  value={sender.registration_number}
                  onChange={(e) => setSender(p => ({ ...p, registration_number: e.target.value }))}
                  placeholder="事業者登録番号 (任意)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* 明細テーブル */}
          <div className="rounded-2xl bg-glass p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <ListOrdered className="w-4 h-4" /> 明細・金額設定
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> 行を追加
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2 px-2">品名 / 内容</th>
                    <th className="py-2 px-2 w-20 text-center">数量</th>
                    <th className="py-2 px-2 w-16 text-center">単位</th>
                    <th className="py-2 px-2 w-28 text-right">単価 (円)</th>
                    <th className="py-2 px-2 w-20 text-center">税率</th>
                    <th className="py-2 px-2 w-28 text-right">金額</th>
                    <th className="py-2 px-1 w-10 text-center">削除</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {items.map((item, index) => {
                    const itemAmount = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
                    return (
                      <tr key={index} className="hover:bg-slate-900/40">
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                            placeholder="品名・内容"
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            step="any"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs text-center font-mono"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs text-center"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => handleItemChange(index, 'unit_price', Number(e.target.value))}
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs text-right font-mono"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <select
                            value={item.tax_rate}
                            onChange={(e) => handleItemChange(index, 'tax_rate', Number(e.target.value))}
                            className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs text-center font-mono"
                          >
                            <option value={10}>10%</option>
                            <option value={8}>8%</option>
                            <option value={0}>0%</option>
                          </select>
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-slate-200 font-medium">
                          ¥{Math.round(itemAmount).toLocaleString()}
                        </td>
                        <td className="py-2 px-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            disabled={items.length <= 1}
                            className="p-1 rounded text-slate-500 hover:text-red-400 disabled:opacity-30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 合計計算ハイライト表示 */}
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1 text-right text-xs min-w-[220px]">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">小計 (税抜):</span>
                  <span className="font-mono text-slate-200">¥{Math.round(subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">消費税:</span>
                  <span className="font-mono text-slate-200">¥{Math.round(totalTax).toLocaleString()}</span>
                </div>
                <div className="flex justify-between gap-4 pt-1.5 border-t border-slate-800 text-sm font-bold">
                  <span className="text-blue-400">ご請求合計:</span>
                  <span className="font-mono text-white text-base">¥{Math.round(grandTotal).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 備考 & 振込先 */}
          <div className="rounded-2xl bg-glass p-6 border border-slate-800 space-y-4">
            <span className="text-xs font-semibold text-pink-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> 件名・振込先・備考メッセージ
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">件名</label>
                <input
                  type="text"
                  value={customTexts.subject}
                  onChange={(e) => setCustomTexts(p => ({ ...p, subject: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">お支払条件</label>
                <input
                  type="text"
                  value={customTexts.payment_terms}
                  onChange={(e) => setCustomTexts(p => ({ ...p, payment_terms: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">振込先口座情報</label>
                <textarea
                  rows={3}
                  value={customTexts.bank_info}
                  onChange={(e) => setCustomTexts(p => ({ ...p, bank_info: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">備考・注記事項</label>
                <textarea
                  rows={3}
                  value={customTexts.notes}
                  onChange={(e) => setCustomTexts(p => ({ ...p, notes: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 右カラム: リアルタイム ライブ PDF プレビュー (5 cols) */}
        <div className={`lg:col-span-5 rounded-2xl bg-glass p-5 border border-slate-800 space-y-4 lg:sticky lg:top-36 ${activeTab === 'form' ? 'hidden lg:block' : 'block'}`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Eye className="w-4 h-4 text-purple-400" />
              <span>ライブ PDF プレビュー</span>
            </div>

            <div className="flex items-center gap-2">
              {previewLoading && (
                <span className="inline-flex items-center gap-1 text-[11px] text-purple-400 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" /> 更新中...
                </span>
              )}
            </div>
          </div>

          {previewBlobUrl ? (
            <div className="relative w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl h-[700px]">
              <iframe
                src={previewBlobUrl}
                className="w-full h-full border-0"
                title="リアルタイムPDFプレビュー"
              />
            </div>
          ) : (
            <div className="h-[600px] flex flex-col items-center justify-center rounded-xl bg-slate-900/50 border border-dashed border-slate-800 text-slate-500 space-y-3">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs">リアルタイムプレビューをレンダリング中...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
