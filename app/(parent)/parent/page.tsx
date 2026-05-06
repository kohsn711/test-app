import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export const metadata = {
  title: '保護者ホーム | 野球ノート',
}

export default async function ParentHomePage() {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub
  if (!userId) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, role')
    .eq('id', userId)
    .maybeSingle()
  if (!profile?.role) redirect('/setup')
  if (profile.role !== 'parent') redirect('/login')

  return (
    <div className="mx-auto w-full max-w-md space-y-4 px-4 py-6">
      <header className="space-y-1">
        <p className="text-xs text-slate-500">保護者</p>
        <h1 className="text-lg font-semibold text-slate-900">
          {profile.display_name} さん
        </h1>
      </header>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold text-slate-900">招待・連携</h2>
        <Link
          href="/parent/links"
          className="block rounded-lg bg-slate-900 px-3 py-2 text-center text-sm font-medium text-white"
        >
          招待・連携を確認する
        </Link>
      </section>
    </div>
  )
}
