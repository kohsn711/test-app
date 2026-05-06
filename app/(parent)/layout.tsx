export default function ParentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex min-h-dvh flex-col bg-slate-50">
      {children}
    </main>
  )
}
