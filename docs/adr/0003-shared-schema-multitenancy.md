# ADR 0003 — Shared Schema Multitenancy

## Context

マルチテナント対応が必須だが、初期段階での運用コストを抑えたい。


## Decision

共有データベース + 共有スキーマ + `tenant_id` カラム方式を採用する。ただし初期からデータ隔離の安全性を高めるため、主要業務テーブルに対して PostgreSQL Row Level Security (RLS) を有効化する方針とする。

## Reason

- デプロイとスキーマ管理が簡単で初期コストが低い
- RLS を併用することで、アプリ側のミスによるクロステナント漏洩リスクを低減できる

## Consequences

- RLS を適切に設定・テストするための初期実装工数が増える
- アプリ側では接続時にセッション変数（例: `app.current_tenant`）を設定するミドルウェアが必要
- 参照整合性のために複合 FK・UNIQUE 制約の追加が必要

## Status

Accepted
