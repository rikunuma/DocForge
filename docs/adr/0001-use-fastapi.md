# ADR 0001 — Use FastAPI

## Context

Python を学びつつ、モダンで型安全な Web API を早く構築したい。

## Decision

`FastAPI` をバックエンド API フレームワークとして採用する。

## Reason

- 型ヒントと Pydantic によるバリデーションが容易
- ドキュメント自動生成（OpenAPI）を標準でサポート
- 非同期処理のサポートと高い開発生産性

## Consequences

- Pydantic, Uvicorn, Starlette などを採用
- 開発者が型ベースの設計に慣れる必要がある

## Status

Accepted
