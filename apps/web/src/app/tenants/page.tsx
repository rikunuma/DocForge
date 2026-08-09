'use client';

import { useEffect, useState } from 'react';
import { 
  Building2, 
  Plus, 
  X, 
  Shield, 
  Sparkles, 
  CheckCircle2, 
  Users, 
  Search, 
  SlidersHorizontal,
  Building
} from 'lucide-react';
import { fetchTenants, createTenant, Tenant } from '@/lib/api';

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔍 検索・フィルター状態
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('ALL');

  // モーダル状態
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    plan: 'standard',
  });
  const [creating, setCreating] = useState(false);

  const loadTenants = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTenants();
      setTenants(data);
    } catch (err: any) {
      setError(err.message || 'テナント一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createTenant(formData);
      setIsModalOpen(false);
      setFormData({ name: '', code: '', plan: 'standard' });
      loadTenants();
    } catch (err: any) {
      alert(err.message || 'テナント登録に失敗しました');
    } finally {
      setCreating(false);
    }
  };

  // 🔍 フィルタリングロジック
  const filteredTenants = tenants.filter((t) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      t.name.toLowerCase().includes(query) ||
      t.code.toLowerCase().includes(query);

    const matchesPlan = planFilter === 'ALL' || t.plan.toLowerCase() === planFilter.toLowerCase();

    return matchesQuery && matchesPlan;
  });

  return (
    <div className="space-y-8">
      {/* ページヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold mb-1">
            <Building2 className="w-4 h-4" />
            <span>マルチテナント管理</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">契約テナント組織一覧</h1>
          <p className="text-slate-400 text-sm mt-1">
            各企業・組織ごとの独立した帳票データ・テンプレート環境を管理・フィルタリングします。
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>新規テナント作成</span>
        </button>
      </div>

      {/* 🔍 リアルタイム検索 & フィルターコントロール */}
      <div className="rounded-2xl bg-glass p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4" /> テナント検索・プラン絞り込み
          </span>
          <span className="text-xs text-slate-400 font-mono">
            該当: <strong className="text-indigo-300 font-bold">{filteredTenants.length}</strong> / {tenants.length} 件
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* フリーワード検索バー */}
          <div className="md:col-span-7 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="企業名・テナント識別コードで検索..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* プラン絞り込みタブ */}
          <div className="md:col-span-5 flex items-center gap-2">
            <span className="text-xs text-slate-400 shrink-0">プラン:</span>
            <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-700 w-full text-xs">
              <button
                onClick={() => setPlanFilter('ALL')}
                className={`flex-1 py-1 rounded-lg font-medium transition-all ${
                  planFilter === 'ALL' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                すべて
              </button>
              <button
                onClick={() => setPlanFilter('free')}
                className={`flex-1 py-1 rounded-lg font-medium transition-all ${
                  planFilter === 'free' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Free
              </button>
              <button
                onClick={() => setPlanFilter('standard')}
                className={`flex-1 py-1 rounded-lg font-medium transition-all ${
                  planFilter === 'standard' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setPlanFilter('enterprise')}
                className={`flex-1 py-1 rounded-lg font-medium transition-all ${
                  planFilter === 'enterprise' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Enterprise
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* テナントカード一覧 */}
      {loading ? (
        <div className="p-12 text-center rounded-2xl bg-glass border border-slate-800">
          <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-400 text-sm">テナント情報を読み込み中...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          {error}
        </div>
      ) : filteredTenants.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-glass border border-slate-800 space-y-3">
          <Building className="w-10 h-10 text-slate-500 mx-auto" />
          <p className="text-slate-400 text-sm">条件に該当するテナントが見つかりませんでした。</p>
          {(searchQuery || planFilter !== 'ALL') && (
            <button
              onClick={() => { setSearchQuery(''); setPlanFilter('ALL'); }}
              className="text-xs text-indigo-400 hover:underline font-semibold"
            >
              検索条件をクリア
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTenants.map((tenant) => (
            <div
              key={tenant.id}
              className="rounded-2xl bg-glass p-6 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-xl"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    tenant.plan === 'enterprise'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : tenant.plan === 'standard'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    プラン: {tenant.plan.toUpperCase()}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> アクティブ
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white">{tenant.name}</h2>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">コード: {tenant.code}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
                <span>テナントID: #{tenant.id}</span>
                <span>登録日: {new Date(tenant.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 新規テナント登録モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-glass-modal w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-700">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">新規テナント登録</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">企業・組織名 *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="例: 株式会社ABCコーポレーション"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">識別コード (英数ハイフン) *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData(p => ({ ...p, code: e.target.value }))}
                  placeholder="例: abc-corp"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">契約プラン</label>
                <select
                  value={formData.plan}
                  onChange={(e) => setFormData(p => ({ ...p, plan: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                >
                  <option value="free">Free (無料プラン)</option>
                  <option value="standard">Standard (標準プラン)</option>
                  <option value="enterprise">Enterprise (エンタープライズ)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 disabled:opacity-50"
                >
                  {creating ? '作成中...' : '登録する'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
