# 15 アプリ内通知

## 概要
リアクション・定型コメントが届いた際に学生へアプリ内通知を表示する機能。

## ToDo

### 通知作成
- [ ] リアクション送信時にServer Actionで `notifications` テーブルに insert
- [ ] 定型コメント送信時にServer Actionで `notifications` テーブルに insert
- [ ] `type`（reaction / comment）と送信者情報・対象記録IDを保存

### 通知一覧画面（`app/(student)/notifications/page.tsx`）
- [ ] 通知一覧を新着順で表示
- [ ] 通知タイプ（リアクション / 定型コメント）と送信者名・日時を表示
- [ ] 対象記録へのリンク
- [ ] 既読・未読の管理（`read_at` カラム）

### 通知バッジ
- [ ] 学生ホームまたはナビゲーションに未読通知数を表示
- [ ] バッジの数値は学生ホームのデータフェッチ時に取得

### 既読処理
- [ ] 通知一覧を開いたタイミングで既読にするServer Actionを実装

### アクセス制御
- [ ] 通知は本人のみ閲覧可（RLS + アプリ側チェック）

## 備考
- プッシュ通知（Push Notifications）はMVPスコープ外
