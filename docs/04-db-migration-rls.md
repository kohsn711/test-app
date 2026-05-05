# 04 DBマイグレーション・RLS設定

## 概要
Supabase PostgreSQLのテーブル作成とRow Level Security（RLS）の設定。

## ToDo

### テーブル作成
- `auth.users` は Supabase Auth が自動管理（手動作成不要）。email / created_at / updated_at はここで管理し、自前テーブルに重複させない
- [ ] `profiles`
  - `id` UUID PK, FK → auth.users.id
  - `role` text（student / coach / parent / admin）NOT NULL
  - `display_name` text NOT NULL
  - `created_at` timestamptz DEFAULT now()
  - ※ email は auth.users が管理するため持たない
- [ ] `teams`
- [ ] `team_members`
- [ ] `parent_child_links`（status: pending / active）
- [ ] `daily_records`
- [ ] `practice_entries`
- [ ] `training_entries`
- [ ] `meal_records`
- [ ] `condition_records`
- [ ] `injury_records`
- [ ] `reflection_records`
- [ ] `goals`（title / description / category / target_date / status: active/achieved/abandoned）
- [ ] `reactions`
- [ ] `preset_comments`
- [ ] `comments`
- [ ] `contents`
- [ ] `notifications`

### RLS有効化・ポリシー設定
- [ ] `daily_records` — 本人のみ作成・編集・閲覧
- [ ] `daily_records` — 所属チームのcoachが閲覧可
- [ ] `daily_records` — activeな親子リンクのparentが閲覧可
- [ ] `parent_child_links` — 本人（student / parent）のみ閲覧
- [ ] `team_members` — 同チームメンバーが閲覧可
- [ ] `goals` — 本人のみ作成・編集・閲覧、coachは閲覧のみ
- [ ] `reactions` — coach / parent が対象studentの記録に作成可
- [ ] `comments` — coach / parent が対象studentの記録に作成可
- [ ] `notifications` — 本人のみ閲覧
- [ ] `contents` — adminが作成・編集、published のみ全ユーザーが閲覧

### インデックス・制約
- [ ] `daily_records` に `(student_id, date)` のユニーク制約（1日1記録）
- [ ] 外部キー制約を適切に設定
- [ ] よく使うカラムにインデックスを設定

## 備考
- カラム名はすべて `snake_case`
- RLSとアプリケーション側チェックを必ず併用する
