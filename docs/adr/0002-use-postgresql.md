# ADR 0002 — Use PostgreSQL

## Context

堅牢で拡張性のあるリレーショナルデータベースが必要。

## Decision

`PostgreSQL` を主なデータストアとして採用する。

## Reason

- 安定性と豊富な機能（RLS, JSONB, トランザクション）
- エコシステムが成熟している

## Consequences

- Alembic でマイグレーション管理
- データベース運用とバックアップが必要

## Status

Accepted
