# 02 Supabase プロジェクト作成・環境変数設定

## 概要
Supabaseプロジェクトの作成と環境変数の設定。

## ToDo

- [ ] Supabaseダッシュボードでプロジェクトを新規作成
- [ ] `@supabase/supabase-js` と `@supabase/ssr` をインストール
- [ ] `.env.local` を作成し環境変数を設定

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

- [ ] `utils/supabase/server.ts` を作成（Server Components / Server Actions 用）
- [ ] `utils/supabase/client.ts` を作成（Client Components 用）
- [ ] 旧 `anon` キーではなく新しい publishable キー（`sb_publishable_xxx`）を使っていることを確認
- [ ] `SUPABASE_SERVICE_ROLE_KEY` が `.env.local` にのみ存在しクライアントに露出していないことを確認

## 備考

```ts
// utils/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = async () => {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options))
          } catch {}
        },
      },
    }
  )
}

// utils/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
```
