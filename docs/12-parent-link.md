# 12 保護者メール登録・保護者承認

## 概要
学生が保護者のメールアドレスを登録し、保護者が承認することで親子リンクを確立する。

## ToDo

### 保護者メール登録（学生）
- [x] `app/(student)/settings/parent/page.tsx` を作成
- [x] 保護者のメールアドレス入力フォーム
- [x] 登録Server Action（`create_parent_invite` RPC 経由で `parent_child_links` に `status: pending` を保存）
  - ※ `invited_email` は保護者がまだ auth.users に存在しない段階で保持する一時的な値。承認完了後も削除せず招待履歴として残す
- [x] 新規保護者へ初回設定用メールを送信（Supabase Auth の `signInWithOtp` で OTP メール送信）
- [x] 登録済み保護者への招待はOTPを送らず、パスワードログイン後に承認してもらう

### 保護者アカウント作成・ログイン
- [x] 保護者が招待 OTP からログイン
  - `/login` に認証コード入力導線を追加し、招待メールの OTP をそのまま入力できるようにした
- [x] `/setup` で招待検出 → 保護者用フォーム（名前・パスワード）を表示
- [x] `profiles.role` を `parent` に設定（`completeParentSetup`）
- [x] `parent_child_links` の `parent_id` を更新（保護者承認時に実施）

### 保護者承認
- [x] `app/(parent)/parent/links/page.tsx` を作成（承認待ちリンク一覧 + 既存連携一覧）
- [x] 「承認する」ボタンで `status` を `active` に更新するServer Action（`approveParentLink`）
- [x] 「拒否する」ボタンでリンクを削除するServer Action（`rejectParentLink`）

### アクセス制御
- [x] `parent_child_links` は status が `active` のもののみ権限に使用（pending 行は招待管理用途のみ）
- [x] 学生は自分の保護者リンクのみ作成・キャンセル可能
- [x] 保護者は自分宛の pending と自分が紐づく active のみ閲覧・操作可能
  - 新規保護者の pending は `auth.jwt() ->> 'email'` と `invited_email` の突合で制御
  - 登録済み保護者の pending は `parent_id = auth.uid()` で制御（migration 0014）

## マイグレーション
- `supabase/migrations/0008_parent_invite.sql`: `parent_id` の nullable 化、`invited_email` 追加、新 RLS ポリシー
- `supabase/migrations/0009_parent_invite_jwt_email.sql`: RLS の email 突合を `auth.users` 直参照から JWT クレームに切替（`authenticated` ロールが auth.users を SELECT できないための修正）
- `supabase/migrations/0014_parent_password_login.sql`: 既存保護者判定付きの招待作成RPC、登録済み保護者の pending 承認RLS
