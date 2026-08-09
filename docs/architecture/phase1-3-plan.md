# Phase 1–3 実装計画

目的: Python / FastAPI の学習を進めつつ、DB 接続・認証・テナント基盤を整備する。

Phase 1 — 環境構築と Hello API

- タスク:
  - Python プロジェクト初期化 (`pyproject.toml`)
  - FastAPI アプリの雛形作成（`/api/app/main.py`）
  - Docker Compose で `api`, `db`, `minio` を立ち上げる
  - シンプルな `/health` と `/hello` エンドポイント
- 受け入れ条件:
  - `localhost:8000` で API 応答

Phase 2 — PostgreSQL 接続と SQLAlchemy

- タスク:
  - SQLAlchemy 2.x を導入、DB 接続設定
  - Alembic 初期設定とマイグレーション作成
  - 簡単なモデルとリポジトリ層の雛形
- 受け入れ条件:
  - Alembic でマイグレーションを適用し、テーブルが作成される

Phase 3 — テナント・ユーザー・Membership モデル

- タスク:
  - `tenants`, `users`, `tenant_memberships` モデルと CRUD リポジトリ
  - 招待トークン（`invite_tokens`）とリフレッシュトークン永続化テーブル（`refresh_tokens`）の設計・マイグレーション
  - トークンハッシュ保存と単回使用、リフレッシュトークンローテーションの仕様を実装
  - ユーザー招待フローの設計（トークン発行）
  - 認証エンドポイント（JWT ベース）の実装試作
  - API 層での `tenant_id` 解決ユーティリティ
  - Row Level Security (RLS) の導入とアプリ側ミドルウェアでのセッション変数設定の実装
  - `FORCE ROW LEVEL SECURITY` と `WITH CHECK` ポリシーの検証
- 受け入れ条件:
 - 受け入れ条件:
  - ユーザー作成・招待トークン発行・ログインが動作
  - テナント境界が API レベルで守られる単体テスト
  - RLS が主要テーブルで有効化され、`SET LOCAL` によるセッションスコープが動作する
  - `WITH CHECK` による INSERT/UPDATE 制約と `FORCE ROW LEVEL SECURITY` の動作確認テスト

見積り: 各 Phase は概ね 1–2 週間（個人開発、学習時間込み）
