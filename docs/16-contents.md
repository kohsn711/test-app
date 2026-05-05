# 16 コンテンツ一覧・詳細

## 概要
学生・保護者向けのコンテンツ（記事・外部動画）閲覧機能。

## ToDo

### 学生向けコンテンツ一覧（`app/(student)/contents/page.tsx`）
- [ ] `status = published` かつ `target_audience = student or both` の記事を一覧表示
- [ ] サムネイル・タイトル・カテゴリを表示
- [ ] カテゴリでのフィルタリング

### 保護者向けコンテンツ一覧（`app/(parent)/contents/page.tsx`）
- [ ] `status = published` かつ `target_audience = parent or both` の記事を一覧表示

### コンテンツ詳細（`app/(student)/contents/[id]/page.tsx` など）
- [ ] タイトル・本文・サムネイル画像を表示
- [ ] 外部動画URLがある場合は埋め込みまたはリンク表示
- [ ] 公開日時を表示

### データフェッチ
- [ ] `status = published` のコンテンツのみ取得
- [ ] `target_audience` に応じてフィルタリング
- [ ] `'use cache'` + `cacheLife('hours')` でキャッシュ（頻繁に変わらないコンテンツ）

### UI
- [ ] `next/image` でサムネイル表示（`width` / `height` または `fill` 指定）
- [ ] `loading.tsx` でスケルトン表示
- [ ] `params` は `await params` で取得

## 備考
- 動画は外部URLのみ（自前アップロード・配信は実装しない）
