'use client';

import { useEffect, useState } from 'react';
import { 
  FileSpreadsheet, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Ruler, 
  Palette, 
  FileCheck,
  Maximize2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { fetchTemplates, createTemplate, updateTemplate, deleteTemplate, Template } from '@/lib/api';
import ConfirmModal from '@/components/ConfirmModal';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // モーダル状態
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  // 削除確認モーダル状態
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // フォームデータ
  const [formData, setFormData] = useState<{
    name: string;
    doc_type: string;
    paper_size: string;
    orientation: string;
    width_mm: number;
    height_mm: number;
    margin_top_mm: number;
    margin_bottom_mm: number;
    margin_left_mm: number;
    margin_right_mm: number;
    primary_color: string;
    secondary_color: string;
    show_seal: boolean;
    description: string;
  }>({
    name: '',
    doc_type: 'INVOICE',
    paper_size: 'A4',
    orientation: 'portrait',
    width_mm: 210,
    height_mm: 297,
    margin_top_mm: 15,
    margin_bottom_mm: 15,
    margin_left_mm: 15,
    margin_right_mm: 15,
    primary_color: '#1E3A8A',
    secondary_color: '#F3F4F6',
    show_seal: true,
    description: '',
  });

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTemplates();
      setTemplates(data);
    } catch (err: any) {
      setError(err.message || 'テンプレートの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const openCreateModal = () => {
    setEditingTemplate(null);
    setFormData({
      name: '新規請求書テンプレート (A4)',
      doc_type: 'INVOICE',
      paper_size: 'A4',
      orientation: 'portrait',
      width_mm: 210,
      height_mm: 297,
      margin_top_mm: 15,
      margin_bottom_mm: 15,
      margin_left_mm: 15,
      margin_right_mm: 15,
      primary_color: '#1E3A8A',
      secondary_color: '#F3F4F6',
      show_seal: true,
      description: 'A4サイズ用テンプレート',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (t: Template) => {
    setEditingTemplate(t);
    const layout = t.layout_config || {};
    setFormData({
      name: t.name,
      doc_type: t.doc_type,
      paper_size: t.paper_size,
      orientation: t.orientation,
      width_mm: t.width_mm || 210,
      height_mm: t.height_mm || 297,
      margin_top_mm: t.margin_top_mm,
      margin_bottom_mm: t.margin_bottom_mm,
      margin_left_mm: t.margin_left_mm,
      margin_right_mm: t.margin_right_mm,
      primary_color: layout.primary_color || '#1E3A8A',
      secondary_color: layout.secondary_color || '#F3F4F6',
      show_seal: layout.show_seal !== false,
      description: t.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Partial<Template> = {
        name: formData.name,
        doc_type: formData.doc_type,
        paper_size: formData.paper_size,
        orientation: formData.orientation,
        width_mm: formData.paper_size === 'CUSTOM' ? formData.width_mm : (formData.paper_size === 'A4' ? 210 : formData.paper_size === 'B5' ? 182 : 148),
        height_mm: formData.paper_size === 'CUSTOM' ? formData.height_mm : (formData.paper_size === 'A4' ? 297 : formData.paper_size === 'B5' ? 257 : 210),
        margin_top_mm: formData.margin_top_mm,
        margin_bottom_mm: formData.margin_bottom_mm,
        margin_left_mm: formData.margin_left_mm,
        margin_right_mm: formData.margin_right_mm,
        layout_config: {
          primary_color: formData.primary_color,
          secondary_color: formData.secondary_color,
          show_seal: formData.show_seal,
        },
        description: formData.description,
      };

      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, payload);
      } else {
        await createTemplate(payload);
      }

      setIsModalOpen(false);
      loadTemplates();
    } catch (err: any) {
      alert(err.message || '保存に失敗しました');
    }
  };

  const openDeleteModal = (id: number) => {
    setDeleteTargetId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      await deleteTemplate(deleteTargetId);
      setDeleteTargetId(null);
      loadTemplates();
    } catch (err: any) {
      alert(err.message || '削除に失敗しました');
    } finally {
      setDeleting(false);
    }
  };

  const handlePaperSizeChange = (size: string) => {
    let w = 210, h = 297;
    if (size === 'B5') { w = 182; h = 257; }
    if (size === 'A5') { w = 148; h = 210; }
    setFormData(prev => ({
      ...prev,
      paper_size: size,
      width_mm: size === 'CUSTOM' ? prev.width_mm : w,
      height_mm: size === 'CUSTOM' ? prev.height_mm : h,
    }));
  };

  const targetTemplate = templates.find(t => t.id === deleteTargetId);

  return (
    <div className="space-y-8">
      {/* ページヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold mb-1">
            <Palette className="w-4 h-4" />
            <span>規格・配色設定</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">デザイン・テンプレート管理</h1>
          <p className="text-slate-400 text-sm mt-1">
            用紙サイズ（A4/B5/mm指定）、余白、レイアウトカラーを定義・保存します。
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>新規テンプレート作成</span>
        </button>
      </div>

      {/* テンプレートカード一覧 */}
      {loading ? (
        <div className="p-12 text-center rounded-2xl bg-glass border border-slate-800">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-400 text-sm">テンプレート一覧を読み込み中...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          {error}
        </div>
      ) : templates.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-glass border border-slate-800 space-y-4">
          <p className="text-slate-400">テンプレートが登録されていません。</p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium"
          >
            テンプレートを作成する
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((t) => {
            const layout = t.layout_config || {};
            const primaryColor = layout.primary_color || '#1E3A8A';

            return (
              <div 
                key={t.id}
                className="rounded-2xl bg-glass p-6 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-4">
                  {/* ヘッダーカラー帯 */}
                  <div className="flex items-center justify-between">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {t.doc_type === 'INVOICE' && '請求書'}
                      {t.doc_type === 'PURCHASE_ORDER' && '発注書'}
                      {t.doc_type === 'QUOTATION' && '見積書'}
                      {t.doc_type === 'DELIVERY_NOTE' && '納品書'}
                      {t.doc_type === 'RECEIPT' && '領収書'}
                      {!['INVOICE', 'PURCHASE_ORDER', 'QUOTATION', 'DELIVERY_NOTE', 'RECEIPT'].includes(t.doc_type) && t.doc_type}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">ID: #{t.id}</span>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-white">{t.name}</h2>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{t.description || '説明なし'}</p>
                  </div>

                  {/* スペック */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
                    <div>
                      <span className="text-slate-400 block">用紙サイズ</span>
                      <strong className="text-slate-200">{t.paper_size} ({t.orientation === 'portrait' ? '縦' : '横'})</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">寸法 (W×H)</span>
                      <strong className="text-slate-200">{t.width_mm} × {t.height_mm} mm</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">余白 (上下左右)</span>
                      <strong className="text-slate-200">{t.margin_top_mm} / {t.margin_bottom_mm} / {t.margin_left_mm} / {t.margin_right_mm} mm</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">テーマカラー</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-3 h-3 rounded-full border border-white/20 inline-block" style={{ backgroundColor: primaryColor }} />
                        <span className="text-slate-300 font-mono text-[10px]">{primaryColor}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => openDeleteModal(t.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="テンプレート削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(t)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                    <span>設定の変更</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* テンプレート作成・編集 モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-glass-modal w-full max-w-2xl rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-700">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-bold text-white">
                  {editingTemplate ? 'テンプレートの編集' : '新規テンプレート作成'}
                </h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> 1. 基本設定・種別
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">テンプレート名称 *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">帳票種別 *</label>
                    <select
                      value={formData.doc_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, doc_type: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="INVOICE">請求書 (INVOICE)</option>
                      <option value="PURCHASE_ORDER">発注書 (PURCHASE_ORDER)</option>
                      <option value="QUOTATION">見積書 (QUOTATION)</option>
                      <option value="DELIVERY_NOTE">納品書 (DELIVERY_NOTE)</option>
                      <option value="RECEIPT">領収書 (RECEIPT)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-1.5">
                  <Ruler className="w-4 h-4" /> 2. 用紙サイズ・向き・余白設定
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">用紙サイズ</label>
                    <select
                      value={formData.paper_size}
                      onChange={(e) => handlePaperSizeChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="A4">A4 (210×297 mm)</option>
                      <option value="B5">B5 (182×257 mm)</option>
                      <option value="A5">A5 (148×210 mm)</option>
                      <option value="CUSTOM">カスタム指定 (mm)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">用紙の向き</label>
                    <select
                      value={formData.orientation}
                      onChange={(e) => setFormData(prev => ({ ...prev, orientation: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="portrait">縦向き (Portrait)</option>
                      <option value="landscape">横向き (Landscape)</option>
                    </select>
                  </div>

                  {formData.paper_size === 'CUSTOM' ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">幅 (mm)</label>
                        <input
                          type="number"
                          value={formData.width_mm}
                          onChange={(e) => setFormData(prev => ({ ...prev, width_mm: Number(e.target.value) }))}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">高さ (mm)</label>
                        <input
                          type="number"
                          value={formData.height_mm}
                          onChange={(e) => setFormData(prev => ({ ...prev, height_mm: Number(e.target.value) }))}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">規格寸法</label>
                      <input
                        type="text"
                        disabled
                        value={`${formData.width_mm} × ${formData.height_mm} mm`}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 text-sm"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">上余白 (mm)</label>
                    <input
                      type="number"
                      value={formData.margin_top_mm}
                      onChange={(e) => setFormData(prev => ({ ...prev, margin_top_mm: Number(e.target.value) }))}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">下余白 (mm)</label>
                    <input
                      type="number"
                      value={formData.margin_bottom_mm}
                      onChange={(e) => setFormData(prev => ({ ...prev, margin_bottom_mm: Number(e.target.value) }))}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">左余白 (mm)</label>
                    <input
                      type="number"
                      value={formData.margin_left_mm}
                      onChange={(e) => setFormData(prev => ({ ...prev, margin_left_mm: Number(e.target.value) }))}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">右余白 (mm)</label>
                    <input
                      type="number"
                      value={formData.margin_right_mm}
                      onChange={(e) => setFormData(prev => ({ ...prev, margin_right_mm: Number(e.target.value) }))}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-1.5">
                  <Palette className="w-4 h-4" /> 3. デザイン・テーマ配色
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">メインテーマカラー</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.primary_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                        className="w-10 h-10 rounded-lg cursor-pointer bg-slate-900 border border-slate-700"
                      />
                      <input
                        type="text"
                        value={formData.primary_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">説明・メモ</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium shadow-lg shadow-blue-600/30"
                >
                  {editingTemplate ? '更新を保存' : 'テンプレートを登録'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* カスタム確認削除モーダル */}
      <ConfirmModal
        isOpen={deleteTargetId !== null}
        title="テンプレートの削除"
        message={`「${targetTemplate?.name || 'このテンプレート'}」を削除してもよろしいですか？関連する書類データに影響が出る場合があります。`}
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
