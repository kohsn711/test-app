export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-dvh bg-slate-50">
      <main>{children}</main>
    </div>
  )
}
