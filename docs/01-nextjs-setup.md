# 01 Next.js プロジェクト作成

## 概要
Next.js App Routerプロジェクトの初期セットアップ。

## ToDo

- [ ] `create-next-app` でプロジェクト生成（TypeScript / App Router / Tailwind CSS v4）
- [ ] `eslint.config.mjs` のフラット設定（v9）を確認
- [ ] `tsconfig.json` の `paths` でパスエイリアス `@/*` を設定
- [ ] `app/layout.tsx` にルートレイアウトを作成
- [ ] `app/globals.css` にTailwind CSSをインポート（`tailwind.config.js` は使わない）
- [ ] `postcss.config.mjs` に `@tailwindcss/postcss` を設定
- [ ] `npm run dev` / `npm run build` / `npm run lint` が正常に動作することを確認
- [ ] `.gitignore` に `.env.local` が含まれていることを確認
- [ ] 不要なサンプルファイル（`app/page.tsx` のデモコンテンツ等）を削除

## 備考
- `pages/` ディレクトリは作らない。App Router専用
- テストランナーはMVPでは不要
