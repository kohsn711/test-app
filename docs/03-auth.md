# 03 認証実装

## 概要
Supabase Authを使ったメール認証コードによるパスワードレスログイン。

## ToDo

### middleware
- [ ] `middleware.ts` をプロジェクトルートに作成
- [ ] `supabase.auth.getClaims()` でトークンを更新
- [ ] 更新済みトークンを `request.cookies.set` と `response.cookies.set` の両方に渡す
- [ ] 未認証ユーザーを保護ルートからログインページへ `redirect`

### ログイン画面（全ロール共通）
- [ ] `app/(auth)/login/page.tsx` を作成
- [ ] メールアドレス入力フォームを実装
- [ ] OTP（認証コード）送信のServer Actionを実装
- [ ] `app/(auth)/login/verify/page.tsx` を作成（コード入力画面）
- [ ] コード検証のServer Actionを実装
- [ ] ログイン成功後にロール別ホームへ `redirect`

### ロール判定
- [ ] `profiles.role` の値（student / coach / parent / admin）でリダイレクト先を分岐
- [ ] 未設定（初回ログイン）の場合は初期設定画面へ遷移

### ログアウト
- [ ] ログアウトのServer Actionを実装（`supabase.auth.signOut()`）
- [ ] ログアウト後にログイン画面へ `redirect`

## 重要ルール
- サーバーコードでは `getSession()` を使わない。必ず `getClaims()` を使う
- Server Actionの中でも認証チェックを必ず行う
