# 11 監督の選手一覧・記録閲覧

## 概要
コーチが所属チームの選手一覧と各選手の記録を閲覧する機能。

## ToDo

### チームダッシュボード（`app/(coach)/dashboard/page.tsx`）
- [ ] 所属チームの選手一覧表示
- [ ] 各選手の直近記録状況（連続日数・最終記録日）を表示
- [ ] 選手名クリックで記録一覧へ遷移

### 選手記録一覧（`app/(coach)/students/[studentId]/page.tsx`）
- [ ] 選手の記録をカレンダー形式または一覧形式で表示
- [ ] 日付クリックで記録詳細へ遷移

### 選手記録詳細（`app/(coach)/students/[studentId]/record/[date]/page.tsx`）
- [ ] 学生の記録詳細を閲覧（08と同様の表示）
- [ ] リアクション・定型コメント入力UI（14で実装）

### 選手目標確認（`app/(coach)/students/[studentId]/goals/page.tsx`）
- [ ] 選手の目標一覧を表示

### データフェッチとアクセス制御
- [ ] 自分のチームに所属する学生のみ表示（RLS + アプリ側チェック）
- [ ] 他チームの学生データにアクセスした場合は `notFound()`
- [ ] `params` は `await params` で取得

### UI
- [ ] `loading.tsx` でスケルトン表示
- [ ] `error.tsx` でエラー表示
