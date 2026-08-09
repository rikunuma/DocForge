Membership 無効化とトークン失効:

- Membership が管理画面で削除/無効化された場合、既発行のアクセストークンは短期間で自動失効するように設計する（例: アクセストークン寿命 15 分）。
- リフレッシュトークンは即時失効させ、`refresh_tokens` の該当レコードを `revoked_at` でマークする。可能であればアクセストークンの即時無効化のためにトークン失効リスト（短期キャッシュ、Redis 等）を参照する。
- セキュリティ要求が高い API では、各リクエストで `tenant_memberships` の有効性を確認するオプションを設ける（パフォーマンスとセキュリティのトレードオフ）。
- 招待トークン設計（テーブル: `invite_tokens`）
	- `id`, `tenant_id`, `email`, `role`, `token_hash`, `issued_by_user_id`, `expires_at`, `used_at`, `created_at`
	- 招待は単回使用（`used_at` を記録）、有効期限を設定

- リフレッシュトークン設計（テーブル: `refresh_tokens`）
	- `id`, `user_id`, `token_hash`, `issued_from`, `user_agent`, `revoked_at`, `expires_at`, `created_at`
	- ローテーションを採用: 新リフレッシュトークン発行時に古いトークンを失効させる運用を推奨
	- 全セッション失効 API を提供（例: パスワード変更時の `revoke_all_refresh_tokens(user_id)`）

トークンハッシュの扱い:

- 招待トークンやリフレッシュトークンの検証用ハッシュには高速過ぎる KDF（bcrypt/argon2）ではなく、検索効率を考慮して `SHA-256` ないしは `HMAC-SHA256` を用いる。トークンの実物はメール等で配布し、DB にはハッシュのみを保存する。
- パスワードの永続化には引き続き `bcrypt` / `argon2` を利用する。
# 認証とユーザー管理

基本モデル:

- `users` テーブル: アカウント情報（email, password_hash, status）
- `tenants` テーブル: テナント情報
- `tenant_memberships` テーブル: `user_id` ⇄ `tenant_id` 関係と `role`

ロール例:

- OWNER, ADMIN, MANAGER, ACCOUNTING, SALES, USER, VIEWER

招待フロー (推奨):

1. Tenant Admin がメールアドレスを入力して招待を作成
2. 招待メールに固有トークン付き URL を送信
3. ユーザーは URL でアクセスしてパスワードを設定


認証方式（初期）:

- JWT ベースのアクセストークン + リフレッシュトークン
- セッション管理は短期的に API レベルで完結させる（将来 OAuth2 / OpenID Connect 検討）

tenant_id 解決とテナント選択:

- ER では1ユーザーが複数テナントに所属可能であるため、ログイン直後に「アクティブテナント」をユーザーが選択するフローを設ける
	- 初回ログイン時は所属テナントが1つなら自動選択、複数ある場合は選択画面を返す
	- 選択したテナントはアクセストークンのクレーム（例: `tenant_id`）として格納する
	- テナント切替用 API: `POST /api/tenant/switch`（認証済み、所属チェックあり）を提供し、新しいアクセストークンを発行する
	- トークンに含める `tenant_id` はサーバ側で membership を検証した上で発行する（クライアント入力を信用しない）

招待トークンとリフレッシュトークン永続化:

- 招待やリフレッシュ用のトークンは DB にハッシュ保存する。プレーンテキストは保存しない。
- 招待トークン設計（テーブル: `invite_tokens`）
	- `id`, `tenant_id`, `email`, `role`, `token_hash`, `issued_by_user_id`, `expires_at`, `used_at`, `created_at`
	- 招待は単回使用（`used_at` を記録）、有効期限を設定

- リフレッシュトークン設計（テーブル: `refresh_tokens`）
	- `id`, `user_id`, `token_hash`, `issued_from`, `user_agent`, `revoked_at`, `expires_at`, `created_at`
	- ローテーションを採用: 新リフレッシュトークン発行時に古いトークンを失効させる運用を推奨
	- 全セッション失効 API を提供（例: パスワード変更時の `revoke_all_refresh_tokens(user_id)`）

トークン運用上の注意:

- トークンハッシュには安全なハッシュ（bcrypt/argon2）を使う（速いハッシュは不可）
- リフレッシュトークンの窃取対策として、発行情報（IP, user_agent）を保存して異常検知ログを出す
- 招待トークンの発行者、ターゲットテナント・ロールを保持し、招待失効や取り消しに対応する

権限チェック:

- Platform Admin と Tenant Admin の境界を明確にする
- 各 API で必要なロール/権限を宣言的にチェックするユーティリティを用意する

