import { signOut } from '@/lib/auth-actions'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500">Admin</p>
            <p className="text-sm font-semibold text-slate-900">管理画面</p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              ログアウト
            </button>
          </form>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
