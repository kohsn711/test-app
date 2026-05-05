# 07 今日の記録作成・編集

## 概要
学生が1日1回記録を入力するメイン機能。6カテゴリのタブ形式で入力。

## ToDo

### 画面（`app/(student)/record/[date]/page.tsx`）
- [ ] カテゴリタブUI（practice / training / meal / condition / injury / reflection）
- [ ] 未入力カテゴリがあっても「保存」できる設計
- [ ] 既存記録がある場合は編集モードで表示

### カテゴリ別入力フォーム

**practice（練習）**
- [ ] 素振り: 回数入力
- [ ] ティー打撃: 回数入力
- [ ] キャッチボール: 分入力
- [ ] 投球練習: 球数入力
- [ ] 守備練習: 分入力
- [ ] 走塁練習: 分入力
- [ ] 自由メモ: テキスト入力

**training（体づくり）**
- [ ] ランニング: km または 分入力
- [ ] ダッシュ: 本数入力
- [ ] 腕立て: 回数入力
- [ ] 腹筋: 回数入力
- [ ] スクワット: 回数入力
- [ ] ストレッチ: 分入力
- [ ] 自由メモ: テキスト入力

**meal（食事）**
- [ ] 朝食: ate / skipped 選択
- [ ] 昼食: ate / skipped 選択
- [ ] 夕食: ate / skipped 選択
- [ ] 補食: ate / skipped 選択
- [ ] 水分: low / normal / high 選択
- [ ] 食事メモ: テキスト入力

**condition（睡眠・体調）**
- [ ] 睡眠時間: 数値入力
- [ ] 起床時刻: 時刻入力
- [ ] 就寝時刻: 時刻入力
- [ ] 体重: 数値入力
- [ ] 体調: good / normal / bad 選択

**injury（ケガ・痛み）**
- [ ] 痛みの有無: トグル
- [ ] 部位選択: shoulder / elbow / wrist / back / hip / knee / ankle / thigh / calf / other
- [ ] 痛みレベル: 1〜5 選択
- [ ] 練習への影響: none / little / serious 選択
- [ ] メモ: テキスト入力

**reflection（日記・振り返り）**
- [ ] 今日できたこと: テキスト入力
- [ ] 課題・反省: テキスト入力
- [ ] 明日やること: テキスト入力
- [ ] 今日の気分: 1〜5 選択

### Server Action
- [ ] `daily_records` の upsert（当日レコードがなければ作成、あれば更新）
- [ ] 各カテゴリの子テーブルに upsert
- [ ] 保存後に記録詳細または学生ホームへ `redirect`
- [ ] Server Action内で認証チェック・本人確認

## 備考
- 必須入力を増やしすぎない。すべてのフィールドはオプション
- 数値・選択・チェック式を中心にする
- `params` は `await params` で取得（Promiseのため）
