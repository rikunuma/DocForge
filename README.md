# DocForge

DocForge の Web (Next.js + Shadcn/ui)、API (FastAPI)、および データベース (PostgreSQL) の開発環境です。

## ディレクトリ構成

```text
DocForge/
├── .devcontainer/            # GitHub Codespaces 自動起動設定
│   ├── devcontainer.json
│   └── setup.sh
├── apps/
│   ├── api/                  # FastAPI アプリケーション
│   │   ├── app/              # アプリケーションソースコード
│   │   ├── Dockerfile        # APIコンテナ用Dockerfile
│   │   └── requirements.txt  # Python依存パッケージ
│   └── web/                  # Next.js アプリケーション
│       ├── src/
│       │   ├── app/          # App Router
│       │   ├── components/   # UIコンポーネント (Shadcn/ui)
│       │   └── lib/          # ユーティリティ (utils.ts等)
│       ├── Dockerfile        # Webコンテナ用Dockerfile
│       └── package.json
├── docker-compose.yml        # Docker Compose設定ファイル (db, api, web)
├── .env.example              # 環境変数サンプル
└── README.md
```

## GitHub Codespaces 自動起動機能

本リポジトリは **GitHub Codespaces** に最適化されています。
Codespaces の起動時に `.devcontainer/devcontainer.json` の `postStartCommand` フックが自動的に発火し、以下の処理が完全無人・全自動で実行されます：

1. `.env` ファイルの自動コピー作成
2. Docker Compose（PostgreSQL / FastAPI / Next.js）の自動ビルド＆起動
3. ポートフォワーディング（`3000`, `8000`, `5432`）の自動設定

---

## 手動でのコンテナ一括起動

ローカル環境等で手動起動する場合は、以下のコマンドを実行します：

```bash
docker compose up --build -d
```

アクセス先:
- **Web (Next.js)**: `http://localhost:3000`
- **API (FastAPI)**: `http://localhost:8000`
- **Swagger API Docs**: `http://localhost:8000/docs`
- **PostgreSQL**: `localhost:5432`
