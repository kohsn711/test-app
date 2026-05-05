# 19 Vercelデプロイ

## 概要
Next.jsアプリをVercelにデプロイし、本番環境を構築する。

## ToDo

### Vercelプロジェクト設定
- [ ] VercelにGitHubリポジトリを連携
- [ ] Frameworkを `Next.js` に設定
- [ ] Root Directoryを正しく設定

### 環境変数設定（Vercelダッシュボード）
- [ ] `NEXT_PUBLIC_SUPABASE_URL` を設定
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` を設定
- [ ] `SUPABASE_SERVICE_ROLE_KEY`（またはsecretキー）を設定（非公開）
- [ ] その他必要な環境変数をすべて設定

### Supabase本番設定
- [ ] SupabaseのSite URLをVercelのデプロイURLに設定
- [ ] Redirect URLsにVercelのURLを追加（Auth設定）
- [ ] 本番DBのRLSが正しく動作することを確認

### デプロイ確認
- [ ] 本番環境でログインが動作する
- [ ] 本番環境でデータの読み書きができる
- [ ] `npm run build` 相当のビルドがVercelで成功する
- [ ] HTTPSで配信されていることを確認

### CDNキャッシュ注意
- [ ] セッショントークンが含まれるレスポンスがキャッシュされていないことを確認
- [ ] ISRを使用している場合は個人データが含まれないことを確認

## 備考
- `SUPABASE_SERVICE_ROLE_KEY` はVercelの環境変数に設定するが、クライアントバンドルには含めない
- 環境変数をソースコードにハードコードしない
