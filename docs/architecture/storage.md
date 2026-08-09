# オブジェクトストレージ設計（MinIO / S3 等）

目的: PDF 等のバイナリ大ファイルは DB に保存せず、オブジェクトストレージに保存する。

ファイルメタデータ (テーブル: `objects` / `files`):

- `id` UUID PK
- `tenant_id` UUID FK NOT NULL
- `owner_resource_type` string (例: DOCUMENT, CONTRACT)
- `owner_resource_id` UUID（オプション）
- `path` string NOT NULL (例: `tenant-001/invoices/2026/INV-0001.pdf`)
- `storage_class` string
- `content_type` string
- `size_bytes` bigint
- `checksum` string
- `uploaded_by_user_id` UUID
- `created_at`, `deleted_at`

認可方針:

- テナント分離: パスは `tenant-<id>/...` で分離し、アプリ側で `tenant_id` を照合する
- 保管ポリシー: テナント管理者のみが自社ファイルを削除可能。Platform Admin は限定的にアクセス可（監査目的）
- 署名付き URL: 一時的なダウンロード用に署名付き URL（Presigned URL）を発行。発行ログを記録する

アップロード制限:

- ファイル最大サイズ、許可 MIME タイプを決める（例: PDF, image/*）
- ウイルススキャン: アップロード時にウイルススキャン（ClamAV 等）を行う設計を推奨

保持期間とライフサイクル:

- テナントごとに保存方針を設定可能にする（例: 7 年保存、法務要件に応じる）

移行とバックアップ:

- MinIO のバケットは将来 S3 等へ移行可能なパス命名規則を採用
