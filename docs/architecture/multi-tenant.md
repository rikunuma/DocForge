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

セキュリティ:

- 将来的に PostgreSQL の Row Level Security (RLS) を検討
- サービス側では常に `tenant_id` を絞ってクエリを構築し、テストで越境アクセスを検出する

データ分割の考慮点:

- 大規模成長時は「マルチテナント分割（DB分離）」や「シャーディング」の導入を検討
- ファイルストレージはテナント単位でパスを分ける（例: `tenant-001/invoices/...`）
