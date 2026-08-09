# マルチテナント設計

選定: まずは「共有データベース + 共有スキーマ + tenant_id カラム」を採用する。

理由:

- 運用コストが低く、スキーマ変更・マイグレーションが容易
- テナント数が初期段階では限定的であることを想定


実装方針:

- すべての業務テーブルに `tenant_id` カラムを追加する（必須）
- API レイヤーで認証済みユーザーの所属 `tenant_id` を決定し、SQL レベルでフィルタする
- クライアントから送信された `tenant_id` は信用しない

例: ドキュメント取得

```sql
SELECT * FROM documents
WHERE tenant_id = :current_tenant_id
  AND id = :document_id;
```

セキュリティ（必須措置）:

- クエリ条件付けの忘れは重大な情報漏洩につながるため、初期段階から次のいずれかを必須とする:
  1) PostgreSQL の Row Level Security (RLS) を主要な業務テーブル（`documents`, `clients`, `contracts`, `document_items`, `audit_logs` 等）に対して有効化する
  2) アプリケーション層で「テナントスコープ付き Repository」を厳格に適用し、直接 SQL を叩く層を禁止する（コードレビュー、分析クエリを除く）

推奨: 初期は RLS を有効化しておき、運用負荷が増えた段階でポリシーを見直す。

RLS の設定例 (概念):

```sql
-- テーブルを RLS 対象にする
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- ポリシー: 現在のセッション変数 'current_tenant' と一致する行のみ許可
CREATE POLICY tenant_isolation ON documents
  USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- アプリから接続時にセッション変数を設定
SET LOCAL app.current_tenant = '<tenant-uuid>';
```

アプリ実装側の補助:

- リポジトリ雛形を作成し、直接 SQL を実行するユーティリティを原則禁止する
- テストで越境アクセスケースをカバレッジに含める
- データベースはSupabaseを採用して、PostgreSQLベースの設計・実装を進める

データ分割の考慮点:

- 大規模成長時は「マルチテナント分割（DB分離）」や「シャーディング」の導入を検討
- ファイルストレージはテナント単位でパスを分ける（例: `tenant-001/invoices/...`）
