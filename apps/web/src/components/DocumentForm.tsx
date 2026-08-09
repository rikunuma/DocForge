'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  FileText, 
  User, 
  Building, 
  ListOrdered, 
  HelpCircle, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { Template, DocumentConfig, DocumentItem, createDocument, updateDocument, fetchTemplates } from '@/lib/api';

interface DocumentFormProps {
  initialData?: DocumentConfig;
  isEdit?: boolean;
}

export default function DocumentForm({ initialData, isEdit = false }: DocumentFormProps) {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [saving, setSaving] = useState(false);

  // フォームステート
  const [templateId, setTemplateId] = useState<number>(initialData?.template_id || 0);
  const [title, setTitle] = useState<string>(initialData?.title || '御 請 求 書');
  const [docNumber, setDocNumber] = useState<string>(initialData?.doc_number || '');
  const [issueDate, setIssueDate] = useState<string>(initialData?.issue_date || '');
  const [dueDate, setDueDate] = useState<string>(initialData?.due_date || '');

  // SSRハイドレーション差異を防ぐため、マウント後に未設定の場合のみ初期生成
  useEffect(() => {
    if (!docNumber && !initialData?.doc_number) {
      setDocNumber(`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    }
    if (!issueDate && !initialData?.issue_date) {
      setIssueDate(new Date().toISOString().split('T')[0]);
    }
  }, [initialData]);


  // 宛先情報
  const [recipient, setRecipient] = useState({
    company_name: initialData?.recipient_info?.company_name || '株式会社サンプル',
    department: initialData?.recipient_info?.department || '営業本部',
    contact_person: initialData?.recipient_info?.contact_person || '佐藤 健',
    honorific: initialData?.recipient_info?.honorific || '御中',
  });

  // 発行元情報
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
          { name: 'Webシステム要件定義・設計', quantity: 1, unit: '式', unit_price: 300000, tax_rate: 10 },
          { name: 'FastAPI / PostgreSQL バックエンド構築', quantity: 1, unit: '式', unit_price: 250000, tax_rate: 10 },
        ]
  );

  // カスタム文言
  const [customTexts, setCustomTexts] = useState({
    subject: initialData?.custom_texts?.subject || 'システム構築業務に関するご請求',
    notes: initialData?.custom_texts?.notes || '毎度格別のご愛顧を賜り厚く御礼申し上げます。下記の通りご請求申し上げます。',
    bank_info: initialData?.custom_texts?.bank_info || 'みずほ銀行 丸の内支店（100）\n普通 1234567\nカ）ドックフォージ',
    payment_terms: initialData?.custom_texts?.payment_terms || '翌月末銀行振込（振込手数料は貴社負担）',
  });

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
  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unit_price)), 0);
  const totalTax = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unit_price) * (Number(item.tax_rate) / 100)), 0);
  const grandTotal = subtotal + totalTax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateId) {
      alert('テンプレートを選択してください');
      return;
    }

    setSaving(true);
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

      if (isEdit && initialData) {
        await updateDocument(initialData.id, payload);
      } else {
        await createDocument(payload);
      }

      router.push('/documents');
    } catch (err: any) {
      alert(err.message || '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* フォームヘッダー */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>戻る</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-600/30 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? '保存中...' : isEdit ? '更新内容を保存' : '帳票文言を保存'}</span>
          </button>
        </div>
      </div>

      {/* 1. テンプレート選択と基本情報 */}
      <div className="rounded-2xl bg-glass p-6 border border-slate-800 space-y-6">
        <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
          <FileText className="w-4 h-4" />
          <span>1. 適用テンプレート・基本情報</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">適用テンプレート *</label>
            {loadingTemplates ? (
              <div className="text-xs text-slate-400 py-2">読み込み中...</div>
            ) : (
              <select
                value={templateId}
                onChange={(e) => setTemplateId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.doc_type})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">帳票表題（タイトル） *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 御 請 求 書"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">帳票番号 *</label>
            <input
              type="text"
              required
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">発行日 *</label>
            <input
              type="date"
              required
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* 2. 宛先情報 & 発行元情報 (左右2列) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 宛先情報 */}
        <div className="rounded-2xl bg-glass p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <User className="w-4 h-4" />
            <span>2. 宛先文言設定（取引先）</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">宛先 会社名 / 氏名 *</label>
              <input
                type="text"
                required
                value={recipient.company_name}
                onChange={(e) => setRecipient(p => ({ ...p, company_name: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">部署名</label>
                <input
                  type="text"
                  value={recipient.department}
                  onChange={(e) => setRecipient(p => ({ ...p, department: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">敬称</label>
                <select
                  value={recipient.honorific}
                  onChange={(e) => setRecipient(p => ({ ...p, honorific: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
                >
                  <option value="御中">御中</option>
                  <option value="様">様</option>
                  <option value="各位">各位</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">ご担当者名</label>
              <input
                type="text"
                value={recipient.contact_person}
                onChange={(e) => setRecipient(p => ({ ...p, contact_person: e.target.value }))}
                placeholder="山田 太郎"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* 発行元情報 */}
        <div className="rounded-2xl bg-glass p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
            <Building className="w-4 h-4" />
            <span>3. 発行元文言設定（自社情報）</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">自社 会社名 *</label>
              <input
                type="text"
                required
                value={sender.company_name}
                onChange={(e) => setSender(p => ({ ...p, company_name: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">郵便番号</label>
                <input
                  type="text"
                  value={sender.postal_code}
                  onChange={(e) => setSender(p => ({ ...p, postal_code: e.target.value }))}
                  placeholder="100-0005"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">電話番号</label>
                <input
                  type="text"
                  value={sender.tel}
                  onChange={(e) => setSender(p => ({ ...p, tel: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">住所</label>
              <input
                type="text"
                value={sender.address}
                onChange={(e) => setSender(p => ({ ...p, address: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">事業者登録番号 (任意)</label>

              <input
                type="text"
                value={sender.registration_number}
                onChange={(e) => setSender(p => ({ ...p, registration_number: e.target.value }))}
                placeholder="T1234567890123"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. 明細データテーブル */}
      <div className="rounded-2xl bg-glass p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <ListOrdered className="w-4 h-4" />
            <span>4. 明細・金額設定</span>
          </div>
          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>明細行を追加</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-400">
                <th className="py-2 px-3">品名 / 内容</th>
                <th className="py-2 px-2 w-24 text-center">数量</th>
                <th className="py-2 px-2 w-20 text-center">単位</th>
                <th className="py-2 px-3 w-36 text-right">単価 (円)</th>
                <th className="py-2 px-2 w-24 text-center">税率 (%)</th>
                <th className="py-2 px-3 w-36 text-right">金額 (税抜)</th>
                <th className="py-2 px-2 w-12 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {items.map((item, index) => {
                const itemAmount = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
                return (
                  <tr key={index} className="hover:bg-slate-900/40">
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        required
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        placeholder="品名・サービス名を入力"
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
                    <td className="py-2 px-3">
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
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs text-center font-mono"
                      >
                        <option value={10}>10%</option>
                        <option value={8}>8%</option>
                        <option value={0}>0%</option>
                      </select>
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-200 font-semibold">
                      ¥{Math.round(itemAmount).toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-center">
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

        {/* 集計サマリー表示 */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            全 <strong className="text-white">{items.length}</strong> 行の明細が登録されています。
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1 text-right text-xs min-w-[240px]">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">小計 (税抜):</span>
              <span className="font-mono text-slate-200">¥{Math.round(subtotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">消費税:</span>
              <span className="font-mono text-slate-200">¥{Math.round(totalTax).toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-4 pt-2 border-t border-slate-800 text-sm font-bold">
              <span className="text-blue-400">ご請求合計 (税込):</span>
              <span className="font-mono text-white text-base">¥{Math.round(grandTotal).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. カスタム文言・備考・口座情報 */}
      <div className="rounded-2xl bg-glass p-6 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-pink-400 font-semibold text-sm">
          <Sparkles className="w-4 h-4" />
          <span>5. カスタム文言・振込先口座・特記事項</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">件名メッセージ</label>
            <input
              type="text"
              value={customTexts.subject}
              onChange={(e) => setCustomTexts(p => ({ ...p, subject: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">お支払条件 / 有効期限</label>
            <input
              type="text"
              value={customTexts.payment_terms}
              onChange={(e) => setCustomTexts(p => ({ ...p, payment_terms: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">振込先口座情報</label>
            <textarea
              rows={3}
              value={customTexts.bank_info}
              onChange={(e) => setCustomTexts(p => ({ ...p, bank_info: e.target.value }))}
              placeholder="銀行名、支店名、口座番号、名義など"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">備考・挨拶文・特記事項</label>
            <textarea
              rows={3}
              value={customTexts.notes}
              onChange={(e) => setCustomTexts(p => ({ ...p, notes: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
