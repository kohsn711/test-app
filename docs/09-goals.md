# 09 学生の目標設定・進捗確認

## 概要
学生が自分で目標を設定・管理し、進捗を確認する機能。記録継続のモチベーション維持が目的。

## ToDo

### 目標一覧画面（`app/(student)/goals/page.tsx`）
- [ ] active な目標一覧を表示
- [ ] 達成済み（achieved）・断念（abandoned）の切り替えタブ
- [ ] 「新規作成」ボタン
- [ ] 各目標の編集・ステータス変更ボタン

### 目標作成・編集（`app/(student)/goals/new/page.tsx` / `app/(student)/goals/[id]/edit/page.tsx`）
- [ ] タイトル入力
- [ ] 内容（description）入力
- [ ] カテゴリ選択（practice / training / meal / condition / general）
- [ ] 達成期限（target_date）入力
- [ ] 保存Server Action（`goals` テーブルに upsert）
- [ ] 認証・本人確認チェック

### ステータス変更
- [ ] 「達成」ボタン → `status` を `achieved` に更新
- [ ] 「断念」ボタン → `status` を `abandoned` に更新
- [ ] 「再開」ボタン → `status` を `active` に戻す

### 学生ホームへの表示
- [ ] `status = active` の目標を学生ホームのサマリーに表示（06と連携）

### コーチからの閲覧
- [ ] コーチダッシュボードから所属チーム学生の目標一覧を閲覧（11と連携）
- [ ] コーチは閲覧のみ（編集・作成不可）

### アクセス制御
- [ ] 学生は自分の目標のみ作成・編集・閲覧
- [ ] コーチは所属チーム学生の目標を閲覧のみ
- [ ] 保護者は閲覧不可（MVP範囲外）

## 備考
- `params` は `await params` で取得
- 目標は複数同時に持てる
