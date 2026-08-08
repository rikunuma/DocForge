# DocForge — System Overview

目的: 企業向けマルチテナント帳票管理SaaSの設計概要を示す。

主要コンポーネント:

- Browser (Next.js + TypeScript)
- API Server (FastAPI + Python)
- Database (PostgreSQL)
- Object Storage (MinIO → 将来S3等)
- PDF Generator (Jinja2 → HTML/CSS → WeasyPrint)

簡易アーキテクチャ図:

Browser → Next.js (App Router, Tailwind) → REST/JSON → FastAPI → PostgreSQL / MinIO / PDF Generator

推奨ディレクトリ構成 (Monorepo):

```
docforge/
  apps/
    web/        # Next.js アプリ
    api/        # FastAPI アプリ
      app/
        api/
        core/
        models/
        repositories/
        schemas/
        services/
        main.py
      templates/  # Jinja2 テンプレート
      pyproject.toml
  docs/
    architecture/
    api/
    database/
    operations/
  docker/
  docker-compose.yml
  README.md
```

短期的な設計方針:

- 共有データベース + 共有スキーマ方式（各行に tenant_id を持つ）
- API 層で tenant_id をクライアントから信用しない。認証済みユーザーの membership から決定する
- 帳票は Jinja2 テンプレートで HTML を生成し、WeasyPrint で PDF に変換する

参照: [docs/architecture/multi-tenant.md](docs/architecture/multi-tenant.md)
参照: [docs/architecture/auth.md](docs/architecture/auth.md)
