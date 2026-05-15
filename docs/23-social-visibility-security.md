# 23 コメント・リアクション閲覧制御の強化

## 概要

記録詳細のコメント・リアクションで、監督と保護者の相互非表示ルールをアプリ表示だけでなくDB/RPC側でも保証する。

## 背景

Ticket 14ではロール別可視性として、学生は全件、監督は監督送信分のみ、保護者は保護者送信分のみを表示する仕様にしている。

現状は `fetchRecordSocial(dailyRecordId, viewerRole)` のアプリ側フィルタで非表示にしているが、RLSは `can_access_daily_record(daily_record_id)` のみを見ており、DB権限としては対象記録にアクセスできる監督・保護者が相手側ロールのコメント・リアクションも読める状態になっている。

## ToDo

### High: アプリ側フィルタの安全化

- [x] `fetchRecordSocial()` で送信者profileまたはroleが取得できない行は非表示にする
- [x] 監督表示では `sender.role = 'coach'` のみ表示する
- [x] 保護者表示では `sender.role = 'parent'` のみ表示する
- [x] 学生表示では既存どおり監督・保護者の両方を表示する

### High: DB/RPC側の閲覧制御

- [x] コメント・リアクション取得用のRPCまたはViewを追加し、viewer role と sender role に基づいて返却対象を制限する
- [x] アプリ側は `comments` / `reactions` を直接selectせず、制限済みの取得経路を使う
- [x] 既存の送信・削除RLSは維持し、閲覧時のロール別制限だけを追加する
- [x] 既存データに対して、監督送信・保護者送信・学生閲覧の表示仕様が変わらないことを確認する

### 仕様確認

- [x] 「監督と保護者の相互非表示」がUI都合ではなくセキュリティ要件であることを明文化する
- [x] 学生本人には監督・保護者双方のコメント・リアクションを見せる仕様でよいか確認する

### 検証

- [x] 監督で、保護者が送信したコメント・リアクションを取得できないことを確認する
- [x] 保護者で、監督が送信したコメント・リアクションを取得できないことを確認する
- [x] 学生で、監督・保護者双方のコメント・リアクションを閲覧できることを確認する
- [x] 送信者profileが取得できない場合に、監督・保護者画面で当該行が表示されないことを確認する
- [x] `npm run lint`
- [x] `npx tsc --noEmit`
- [x] `npm run build`

## 対応内容

- `supabase/migrations/0017_social_visibility_security.sql` を追加
  - `can_view_social_sender(daily_record_id, sender_id)` で閲覧可能な送信者roleをDB側で判定
  - `reactions_select` / `comments_select` policy を更新し、直接DB APIを叩かれてもロール別制限が効くようにした
  - `get_record_reactions(daily_record_id)` / `get_record_comments(daily_record_id)` RPCを追加
- `lib/daily-record.ts` の `fetchRecordSocial()` をRPC経由に変更
  - 記録詳細では `comments` / `reactions` を直接selectしない
  - アプリ側でも sender role を再確認し、想定外または欠落したroleの行を表示しない

## 完了時確認

- 監督: 監督送信分のみ表示、保護者送信分は非表示
- 保護者: 保護者送信分のみ表示、監督送信分は非表示
- 学生: 監督・保護者双方の送信分を表示
- 学生ホームの最近のフィードバック表示は従来どおり
- コメント送信、リアクション送信、リアクション取り消しは従来どおり

## 対応方針

### 1. まず安全側に倒す

- 現在の `visible()` は `sender?.role !== hide` のため、送信者roleが不明な行が表示される可能性がある
- 監督・保護者画面では、送信者roleを確認できた行だけ表示する
- 学生画面は既存仕様どおり全件表示するが、必要に応じて送信者名が空の場合の表示も確認する

### 2. DB/RPCを最終防衛線にする

- Supabase publishable key は公開前提のため、アプリ側フィルタだけを権限制御にしない
- viewer が学生・監督・保護者のどれか、対象記録にアクセスできるか、送信者roleが表示可能かをDB側で判定する
- アプリ側のフィルタは表示上の保険として残し、DB側で返らないことを主たる防御にする

## 調査メモ

- 対象コード: `lib/daily-record.ts` の `fetchRecordSocial()`
- 対象RLS: `supabase/migrations/0002_rls.sql` の `reactions_select` / `comments_select`
- 現状RLSは `public.can_access_daily_record(daily_record_id)` のみを条件にしている
- Ticket 14のロール別可視性仕様と、Ticket 22の「DB/RLSを最終防衛線にする」方針に合わせて対応する
