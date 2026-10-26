import Link from 'next/link'

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-[#FBF9F4] lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden lg:block">
        <img src="/film/auth.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d2a21]/90 via-[#0d2a21]/30 to-[#0d2a21]/10" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Link href="/" className="text-lg font-bold tracking-[0.08em]">FORMED</Link>
          <div>
            <p className="font-[family-name:var(--font-cormorant)] text-5xl italic leading-tight">
              &ldquo;He who began a good work in you will carry it on to completion.&rdquo;
            </p>
            <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#C9A13B]">Philippians 1:6</p>
          </div>
        </div>
      </aside>
      <main className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-10 block text-lg font-bold tracking-[0.08em] text-[#1F5E4A] lg:hidden">FORMED</Link>
          {children}
        </div>
      </main>
    </div>
  )
}
