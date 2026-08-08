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

tenant_id 解決:

- API リクエストから `tenant_id` を受け取らず、トークンに紐づく `user_id` から `tenant_memberships` を参照して現在の `tenant_id` を確定する

権限チェック:

- Platform Admin と Tenant Admin の境界を明確にする
- 各 API で必要なロール/権限を宣言的にチェックするユーティリティを用意する
