# ADR 0003 — Shared Schema Multitenancy

## Context

マルチテナント対応が必須だが、初期段階での運用コストを抑えたい。

## Decision

共有データベース + 共有スキーマ + `tenant_id` カラム方式を採用する。

## Reason

- デプロイとスキーマ管理が簡単
- 初期コストが低い

## Consequences

- アプリ側で厳格な `tenant_id` フィルタが必要
- 将来スケールで DB 分離を検討する必要あり

## Status

Accepted
