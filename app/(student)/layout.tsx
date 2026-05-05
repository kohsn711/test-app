export default function StudentLayout({
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
