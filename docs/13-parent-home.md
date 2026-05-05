# 13 保護者ホーム・子どもの記録閲覧

## 概要
保護者がわが子の記録を閲覧する機能。

## ToDo

### 保護者ホーム（`app/(parent)/home/page.tsx`）
- [ ] 紐づく子どもの一覧表示（複数の場合はリスト）
- [ ] 各子どもの直近記録状況（連続日数・最終記録日）表示
- [ ] 子どもの名前クリックで記録一覧へ遷移

### 子どもの記録一覧（`app/(parent)/children/[studentId]/page.tsx`）
- [ ] カレンダーまたは一覧形式で記録日を表示
- [ ] 日付クリックで記録詳細へ遷移

### 子どもの記録詳細（`app/(parent)/children/[studentId]/record/[date]/page.tsx`）
- [ ] 学生の記録詳細を閲覧（08と同様の表示）
- [ ] リアクション・定型コメント入力UI（14で実装）

### データフェッチとアクセス制御
- [ ] `parent_child_links` が `active` な子どものみ表示（RLS + アプリ側チェック）
- [ ] 紐づいていない学生にアクセスした場合は `notFound()`
- [ ] `params` は `await params` で取得

### UI
- [ ] `loading.tsx` でスケルトン表示
- [ ] `error.tsx` でエラー表示
