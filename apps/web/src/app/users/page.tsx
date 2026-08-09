'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  Plus, 
  X, 
  Shield, 
  Mail, 
  UserCheck, 
  KeyRound, 
  Search, 
  Filter, 
  Building2, 
  RefreshCw,
  SlidersHorizontal,
  UserX
} from 'lucide-react';
import { fetchUsers, createUser, fetchTenants, User, Tenant } from '@/lib/api';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔍 検索・フィルター状態
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [tenantFilter, setTenantFilter] = useState<string>('ALL');

  // モーダル状態
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    tenant_id: 1,
    role: 'TENANT_USER',
  });
  const [creating, setCreating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [uData, tData] = await Promise.all([fetchUsers(), fetchTenants()]);
      setUsers(uData);
      setTenants(tData);
      if (tData.length > 0) {
        setFormData(p => ({ ...p, tenant_id: tData[0].id }));
      }
    } catch (err: any) {
      setError(err.message || 'ユーザーデータの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createUser(formData);
      setIsModalOpen(false);
      setFormData({ email: '', full_name: '', password: '', tenant_id: tenants[0]?.id || 1, role: 'TENANT_USER' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'ユーザー作成に失敗しました');
    } finally {
      setCreating(false);
    }
  };

  // 🔍 フィルタリングロジック
  const filteredUsers = users.filter((u) => {
    // 1. キーワード検索
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      u.full_name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      (u.tenant?.name || '').toLowerCase().includes(query);

    // 2. ロールフィルター
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    // 3. テナントフィルター
    const matchesTenant = tenantFilter === 'ALL' || String(u.tenant_id) === tenantFilter;

    return matchesQuery && matchesRole && matchesTenant;
  });

  return (
    <div className="space-y-8">
      {/* ページヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-sm font-semibold mb-1">
            <Users className="w-4 h-4" />
            <span>アカウント・権限管理</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">ユーザーアカウント管理</h1>
          <p className="text-slate-400 text-sm mt-1">
            所属ユーザーアカウントの作成、権限変更、および検索・フィルタリングを行います。
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition-all shadow-lg shadow-purple-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>新規ユーザー追加</span>
        </button>
      </div>

      {/* 🔍 リアルタイム検索 & フィルターコントロールコントロール */}
      <div className="rounded-2xl bg-glass p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-purple-400 flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4" /> ユーザー検索・フィルタリング
          </span>
          <span className="text-xs text-slate-400 font-mono">
            該当: <strong className="text-purple-300 font-bold">{filteredUsers.length}</strong> / {users.length} 件
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* フリーワード検索バー */}
          <div className="md:col-span-5 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="氏名・メールアドレス・所属会社名で即座に検索..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-purple-500 focus:outline-none"
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

          {/* ロール絞り込み */}
          <div className="md:col-span-4 flex items-center gap-2">
            <span className="text-xs text-slate-400 shrink-0">ロール:</span>
            <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-700 w-full text-xs">
              <button
                onClick={() => setRoleFilter('ALL')}
                className={`flex-1 py-1 rounded-lg font-medium transition-all ${
                  roleFilter === 'ALL' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                すべて
              </button>
              <button
                onClick={() => setRoleFilter('SUPER_ADMIN')}
                className={`flex-1 py-1 rounded-lg font-medium transition-all ${
                  roleFilter === 'SUPER_ADMIN' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                統括
              </button>
              <button
                onClick={() => setRoleFilter('TENANT_ADMIN')}
                className={`flex-1 py-1 rounded-lg font-medium transition-all ${
                  roleFilter === 'TENANT_ADMIN' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                管理者
              </button>
              <button
                onClick={() => setRoleFilter('TENANT_USER')}
                className={`flex-1 py-1 rounded-lg font-medium transition-all ${
                  roleFilter === 'TENANT_USER' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                一般
              </button>
            </div>
          </div>

          {/* テナント絞り込み */}
          {tenants.length > 1 && (
            <div className="md:col-span-3">
              <select
                value={tenantFilter}
                onChange={(e) => setTenantFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              >
                <option value="ALL">すべてのテナント</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ユーザーカード一覧 */}
      {loading ? (
        <div className="p-12 text-center rounded-2xl bg-glass border border-slate-800">
          <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-400 text-sm">ユーザーアカウント情報を読み込み中...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          {error}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-glass border border-slate-800 space-y-3">
          <UserX className="w-10 h-10 text-slate-500 mx-auto" />
          <p className="text-slate-400 text-sm">条件に該当するユーザーが見つかりませんでした。</p>
          {(searchQuery || roleFilter !== 'ALL' || tenantFilter !== 'ALL') && (
            <button
              onClick={() => { setSearchQuery(''); setRoleFilter('ALL'); setTenantFilter('ALL'); }}
              className="text-xs text-purple-400 hover:underline font-semibold"
            >
              フィルター条件をリセットする
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="rounded-2xl bg-glass p-6 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-xl"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    user.role === 'SUPER_ADMIN'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : user.role === 'TENANT_ADMIN'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {user.role === 'SUPER_ADMIN' ? 'プラットフォーム統括' : (user.role === 'TENANT_ADMIN' ? 'テナント管理者' : '一般ユーザー')}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                    <UserCheck className="w-3.5 h-3.5" /> 有効
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white">{user.full_name}</h2>
                  <p className="text-xs font-mono text-slate-300 mt-0.5">{user.email}</p>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-400">
                  <span>所属テナント: </span>
                  <strong className="text-slate-200">{user.tenant?.name || `ID #${user.tenant_id}`}</strong>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
                <span>ユーザーID: #{user.id}</span>
                <span>登録日: {new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 新規ユーザー追加モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-glass-modal w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-700">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-bold text-white">新規ユーザーアカウント追加</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">所属テナント *</label>
                <select
                  value={formData.tenant_id}
                  onChange={(e) => setFormData(p => ({ ...p, tenant_id: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">氏名 *</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData(p => ({ ...p, full_name: e.target.value }))}
                  placeholder="例: 山田 太郎"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">メールアドレス (ログイン用) *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">初期パスワード *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">アカウント権限</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                >
                  <option value="TENANT_USER">一般ユーザー (TENANT_USER)</option>
                  <option value="TENANT_ADMIN">テナント管理者 (TENANT_ADMIN)</option>
                  <option value="SUPER_ADMIN">プラットフォーム統括管理者 (SUPER_ADMIN)</option>
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
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 disabled:opacity-50"
                >
                  {creating ? '追加中...' : 'ユーザーを登録'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
