# 12 保護者メール登録・保護者承認

## 概要
学生が保護者のメールアドレスを登録し、保護者が承認することで親子リンクを確立する。

## ToDo

### 保護者メール登録（学生）
- [ ] `app/(student)/settings/parent/page.tsx` を作成
- [ ] 保護者のメールアドレス入力フォーム
- [ ] 登録Server Action（`parent_child_links` に `status: pending`、`invited_email` を保存して insert）
  - ※ `invited_email` は保護者がまだ auth.users に存在しない段階で保持する一時的な値。承認完了後も削除せず招待履歴として残す
- [ ] 保護者へ招待メールを送信（Supabase Auth のmagic link または自前メール）

### 保護者アカウント作成・ログイン
- [ ] 保護者が招待リンクからアカウント作成
- [ ] `profiles.role` を `parent` に設定
- [ ] `parent_child_links` の `parent_id` を更新

### 保護者承認
- [ ] `app/(parent)/links/page.tsx` を作成（承認待ちリンク一覧）
- [ ] 「承認する」ボタンで `status` を `active` に更新するServer Action
- [ ] 「拒否する」ボタンでリンクを削除するServer Action

### アクセス制御
- [ ] `parent_child_links` は status が `active` のもののみ権限に使用
- [ ] 学生は自分の保護者リンクのみ管理可能
- [ ] 保護者は自分の親子リンクのみ閲覧・操作可能
