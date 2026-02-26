import Image from "next/image";
import Link from "next/link";
import {
  docsPages,
  getDocNeighbors,
  requireDocBySlug,
  type DocSlug
} from "@/lib/docs";
import { cn } from "@/lib/utils";

export function CommandBlock({ children }: { children: string }) {
  return (
    <pre className="mt-4 overflow-x-auto rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-emerald-950">
      <code>{children}</code>
    </pre>
  );
}

export function InlineCode({ children }: { children: string }) {
  return (
    <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-black text-[0.9em]">
      {children}
    </code>
  );
}

export function DocsPageShell({
  slug,
  children
}: {
  slug: DocSlug;
  children: React.ReactNode;
}) {
  const current = requireDocBySlug(slug);
  const { previous, next } = getDocNeighbors(slug);

  return (
    <main className="min-h-screen bg-white">
      <section className="relative pt-14 sm:pt-20 px-4 sm:px-6 pb-14 sm:pb-20 bg-linear-to-b from-emerald-950 to-emerald-700">
        {/* <div className="absolute inset-0 bg-linear-to-b from-emerald-950 via-emerald-700 to-white" /> */}

        <header className="relative">
          <div className="flex justify-between gap-5 items-center w-full max-w-4xl mx-auto">
            <Link href="/">
              <div className="flex items-center gap-2.5">
                <Image
                  src="/logo.png"
                  alt=""
                  height={300}
                  width={300}
                  className="object-contain h-6 w-auto pointer-events-none select-none"
                />
                <span className="text-xl font-medium text-white">Pier</span>
                <div className="text-white/80 text-sm py-1 px-2.5 bg-emerald-600/20 rounded-full font-medium">
                  Docs
                </div>
              </div>
            </Link>
          </div>
        </header>

        <div className="relative w-full max-w-4xl mx-auto mt-14 sm:mt-20">
          <p className="text-xs font-medium text-emerald-400 uppercase tracking-widest">
            Documentation
          </p>
          <h1 className="text-3xl sm:text-4xl font-medium text-white leading-tight mt-4">
            {current.title}
          </h1>
          <p className="mt-5 text-sm sm:text-base font-medium text-white/80 max-w-2xl leading-relaxed">
            {current.description}
          </p>
        </div>
      </section>

      <section className="px-0 sm:px-6 py-7 sm:py-20">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-10 lg:gap-16">
          <aside className="lg:sticky lg:top-20 h-fit w-full overflow-x-auto px-2 sm:px-0 no-scrollbar">
            {/* <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
              Docs
            </p> */}
            <nav className="flex sm:flex-col gap-1">
              {docsPages.map((page) => {
                const active = page.slug === slug;
                return (
                  <Link
                    key={page.slug}
                    href={`/docs/${page.slug}`}
                    className={cn(
                      "py-1.5 px-3 rounded-lg font-medium transition-all",
                      active
                        ? "text-sm text-emerald-600 bg-emerald-600/10"
                        : "text-sm text-neutral-500 hover:bg-neutral-100"
                    )}
                  >
                    {page.title}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <div className="max-w-3xl px-4 sm:px-0">
            <article className="space-y-4 sm:space-y-5">{children}</article>

            <nav className="mt-14 sm:mt-16 border-t border-neutral-200 pt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {previous ? (
                <Link
                  href={`/docs/${previous.slug}`}
                  className="rounded-xl border border-neutral-200 px-4 py-3 hover:border-emerald-600 transition-colors"
                >
                  <p className="text-xs uppercase tracking-wider text-neutral-400">
                    Previous
                  </p>
                  <p className="mt-1 text-sm font-medium text-neutral-800">
                    {previous.title}
                  </p>
                </Link>
              ) : (
                <div />
              )}

              {next ? (
                <Link
                  href={`/docs/${next.slug}`}
                  className="rounded-xl border border-neutral-200 px-4 py-3 hover:border-emerald-600 transition-colors text-left sm:text-right"
                >
                  <p className="text-xs uppercase tracking-wider text-neutral-400">
                    Next
                  </p>
                  <p className="mt-1 text-sm font-medium text-neutral-800">
                    {next.title}
                  </p>
                </Link>
              ) : (
                <div />
              )}
            </nav>
          </div>
        </div>
      </section>

      <footer className="py-8 sm:py-10 px-4 sm:px-6 border-t bg-neutral-50 border-neutral-200">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt=""
              height={100}
              width={100}
              className="h-4.5 w-auto object-contain"
            />
            <span className="text-neutral-600 font-medium">Pier</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <a
              href="https://github.com/malviyahimanshu/pier"
              className="text-sm text-neutral-400 hover:text-neutral-500 font-medium transition-colors"
            >
              GitHub
            </a>
            <Link
              href="/docs"
              className="text-sm text-neutral-600 hover:text-neutral-600 font-medium transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-neutral-400 hover:text-neutral-500 font-medium transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-neutral-400 text-sm font-medium">
              ISC License
            </span>
          </div>
        </div>
      </footer>
      {/* 
      <footer className="py-8 sm:py-10 px-4 sm:px-6 bg-emerald-950 border-t border-emerald-900/60">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt=""
              height={100}
              width={100}
              className="h-4 w-auto object-contain"
            />
            <span className="text-white/70 text-sm font-medium">Pier</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <a
              href="https://github.com/malviyahimanshu/pier"
              className="text-sm text-white/30 hover:text-white/60 font-medium transition-colors"
            >
              GitHub
            </a>
            <Link
              href="/docs"
              className="text-sm text-white/60 font-medium transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-white/30 hover:text-white/60 font-medium transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-white/20 text-sm font-medium">ISC License</span>
          </div>
        </div>
      </footer> */}
    </main>
  );
}
