#!/bin/bash
set -e
echo "Antigravity CLIのセットアップを開始します..."

curl -fsSL https://antigravity.google/cli/install.sh | bash

echo "🚀 [Codespaces Setup] 環境自動セットアップを開始します..."

# .env ファイルが存在しない場合は .env.example からコピー
if [ ! -f .env ]; then
  echo "📄 .env ファイルを作成します..."
  cp .env.example .env
fi

if [ ! -f apps/api/.env ]; then
  echo "📄 apps/api/.env ファイルを作成します..."
  cp apps/api/.env.example apps/api/.env
fi

# Docker Compose コンテナ群の自動起動
echo "🐳 Docker Compose コンテナ環境を自動起動中..."
docker compose up -d

echo "✅ [Codespaces Setup] セットアップおよびコンテナの自動起動が完了しました！"
echo "🌐 Web (Next.js): http://localhost:3000"
echo "⚡ API (FastAPI): http://localhost:8000"
echo "🗄️ Database (PostgreSQL): localhost:5432"
