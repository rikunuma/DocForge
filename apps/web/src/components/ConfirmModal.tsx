'use client';

import { AlertTriangle, X, Trash2, CheckCircle2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title = '実行の確認',
  message,
  confirmText = '削除する',
  cancelText = 'キャンセル',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-glass-modal w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-700/80 relative">
        {/* 閉じるボタン */}
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 警告アイコンヘッダー */}
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg ${
            variant === 'danger'
              ? 'bg-red-500/10 text-red-400 border-red-500/30 shadow-red-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-amber-500/20'
          }`}>
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <span className="text-xs font-semibold text-slate-400">確認ダイアログ</span>
          </div>
        </div>

        {/* メッセージ表示 */}
        <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          {message}
        </p>

        {/* アクションボタン */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-lg disabled:opacity-50 ${
              variant === 'danger'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-red-600/30'
                : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-600/30'
            }`}
          >
            {variant === 'danger' && <Trash2 className="w-4 h-4" />}
            <span>{loading ? '処理中...' : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
