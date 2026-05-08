# 17 運営コンテンツ管理

## 概要
管理者（Admin）がコンテンツ（記事・外部動画）を作成・編集・公開管理する機能。

## ToDo

### コンテンツ一覧（`app/(admin)/admin/contents/page.tsx`）
- [x] 全ステータスのコンテンツを一覧表示（draft / published / archived）
- [x] ステータス・対象ユーザー・公開日時を表示
- [x] 「新規作成」ボタン
- [x] 各コンテンツの「編集」「公開」「アーカイブ」ボタン

### コンテンツ作成・編集（`app/(admin)/admin/contents/[id]/edit/page.tsx`）
- [x] タイトル入力
- [x] 本文入力（リッチテキストまたはMarkdown）
- [x] サムネイル画像アップロード（Supabase Storage）
- [x] 対象ユーザー選択（student / parent / both）
- [x] カテゴリ選択
- [x] 外部動画URL入力
- [x] ステータス切り替え（draft / published / archived）
- [x] 保存Server Action（upsert）

### 公開管理
- [x] 「公開」アクション（`status` を `published` に更新、`published_at` を記録）
- [x] 「非公開」アクション（`status` を `draft` に戻す）
- [x] 「アーカイブ」アクション（`status` を `archived` に更新）

### 画像アップロード
- [x] Supabase Storageにアップロード
- [x] `thumbnail_url` にStorageのURLを保存
- [x] `next/image` で表示する場合は `next.config.ts` に Supabaseドメインを追加

### アクセス制御
- [x] adminロールのみアクセス可能（proxy + アプリ側チェック）

## 備考
- `created_by` に管理者のuser_idを保存
- 動画は外部URLのみ（自前アップロード・変換・配信は実装しない）
- 既存スキーマに合わせ、対象ユーザーは `for_student / for_parent / for_coach` の複数チェックボックスで管理する
- Storage bucket: `content-thumbnails`（migration `0013_content_thumbnails_storage.sql`）
