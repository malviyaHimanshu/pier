import { geistMono } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-14 sm:pt-20 px-4 sm:px-6">
        <div className="absolute inset-0 bg-linear-to-b from-emerald-950 via-emerald-700 to-white" />

        <header className="relative">
          <div className="flex justify-between gap-5 items-center w-full max-w-4xl mx-auto">
            <Link href={'/'}>
              <div className="flex items-center gap-2.5">
                <Image
                  src="/logo.png"
                  alt=""
                  height={300}
                  width={300}
                  className="object-contain h-6 w-auto pointer-events-none select-none"
                />
                <span className="text-xl font-medium text-white">Pier</span>
              </div>
            </Link>

            <div className="text-white/70 text-sm">
              <Link href={'/docs'}>
                <p className="py-1.5 px-3 font-medium hover:bg-white/10 rounded-full transition-all">Docs</p>
              </Link>
            </div>
          </div>
        </header>

        <div className="relative w-full max-w-4xl mx-auto">
          {/* Headline */}
          <div className="mt-14 sm:mt-20 max-w-xl">
            <h1 className="text-3xl sm:text-4xl font-medium text-white leading-tight">
              Your app, terminal and project context inside the same tab
            </h1>
            <p className="mt-6 font-medium text-white/80 leading-relaxed text-sm sm:text-base">
              Pier brings a real terminal panel into localhost pages and routes
              each session to the correct repo based on hostname. Built for
              local-first development and agent-heavy workflows.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="https://github.com/malviyahimanshu/pier"
                className="bg-white text-emerald-950 text-sm font-medium px-5 py-2.5 rounded-full hover:bg-white/90 transition-colors flex items-center gap-2"
              >
                <Image 
                  src={'/chrome.png'}
                  alt=""
                  height={100}
                  width={100}
                  className="h-4 w-auto object-contain"
                />
                Download for Chrome
              </a>
              <a
                href="https://github.com/malviyahimanshu/pier"
                className="text-white text-sm font-medium px-5 py-2.5 rounded-full border border-white/40 opacity-80 hover:opacity-100 transition-all flex items-center gap-2"
              >
                <Image 
                  src={'/github.png'}
                  alt=""
                  height={100}
                  width={100}
                  className="h-4 w-auto object-contain"
                />
                View on GitHub
              </a>
            </div>
          </div>
        </div>

        {/* Product screenshot */}
        <div className="relative group mt-14 sm:mt-20 w-full aspect-[1.53/1] max-w-6xl h-auto mx-auto scale-110 md:scale-100">
          <Image
            src="/product2.png"
            alt="Pier terminal panel embedded in a browser tab"
            fill
            className="w-full h-auto object-contain opacity-0 group-hover:opacity-100 transition-all select-none"
            priority
          />
          <Image
            src="/product.png"
            alt="Pier terminal panel embedded in a browser tab"
            fill
            className="w-full h-auto object-contain opacity-100 group-hover:opacity-0 transition-all select-none"
            priority
          />
        </div>
      </section>

      {/* Problem */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-medium text-emerald-600 uppercase tracking-widest">
            The Problem
          </p>
          <h2 className="text-2xl sm:text-3xl font-medium mt-4 text-neutral-900 max-w-xl leading-snug">
            Context switching is expensive when building in parallel
          </h2>
          <p className="mt-5 text-neutral-500 font-medium max-w-md text-sm sm:text-base">
            When you run multiple apps or agents at once, your workflow
            fragments across windows and tabs.
          </p>

          <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {[
              {
                title: "Too many terminal windows",
                desc: "Each project needs its own terminal. Switching between them breaks your flow.",
              },
              {
                title: "Too many browser tabs",
                desc: "Your app, docs, and tools live in separate tabs with no shared context.",
              },
              {
                title: "Too many repos to track",
                desc: "Mapping the right terminal to the right codebase is manual and error-prone.",
              },
            ].map(({ title, desc }) => (
              <div
                key={title}
                className="border border-neutral-200 rounded-2xl p-6"
              >
                <div className="h-1.5 w-7 bg-emerald-500 rounded-full mb-5" />
                <h3 className="font-medium text-neutral-900">{title}</h3>
                <p className="mt-2 text-sm text-neutral-400 font-medium leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* In Action — screenshot showcases */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 bg-neutral-50">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-medium text-emerald-600 uppercase tracking-widest">
            In Action
          </p>
          <h2 className="text-2xl sm:text-3xl font-medium mt-4 text-neutral-900 max-w-xl leading-snug">
            Everything in one tab
          </h2>

          <div className="mt-14 sm:mt-20 space-y-16 sm:space-y-28">
            {/* Feature 1 — app + terminal side by side */}
            <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12">
              <div className="w-full sm:w-[55%] shrink-0">
                <Image
                  src="/3.png"
                  alt="App running at myapp.localhost with Pier terminal panel open at the bottom"
                  width={1280}
                  height={800}
                  className="w-full h-auto rounded-2xl border border-neutral-200 shadow-sm"
                />
              </div>
              <div className="w-full sm:w-[45%]">
                <span className="text-xs font-semibold text-emerald-500 tabular-nums">
                  01
                </span>
                <h3 className="text-xl sm:text-2xl font-medium text-neutral-900 mt-3 leading-snug">
                  Your app and terminal, side by side
                </h3>
                <p className="mt-4 text-sm text-neutral-500 font-medium leading-relaxed">
                  Each project runs at its own{" "}
                  <code className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-xs">
                    *.localhost
                  </code>{" "}
                  subdomain. Press{" "}
                  <code className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-xs">
                    Cmd+`
                  </code>{" "}
                  to toggle a full PTY terminal right inside your app — no
                  window switching needed.
                </p>
              </div>
            </div>

            {/* Feature 2 — agent output in page */}
            <div className="flex flex-col sm:flex-row-reverse items-center gap-8 sm:gap-12">
              <div className="w-full sm:w-[55%] shrink-0">
                <Image
                  src="/2.png"
                  alt="Terminal panel inside browser showing AI agent output"
                  width={1280}
                  height={800}
                  className="w-full h-auto rounded-2xl border border-neutral-200 shadow-sm"
                />
              </div>
              <div className="w-full sm:w-[45%]">
                <span className="text-xs font-semibold text-emerald-500 tabular-nums">
                  02
                </span>
                <h3 className="text-xl sm:text-2xl font-medium text-neutral-900 mt-3 leading-snug">
                  Agent output, right in the page
                </h3>
                <p className="mt-4 text-sm text-neutral-500 font-medium leading-relaxed">
                  Watch your AI agent work in real time without switching
                  windows. The in-page shell streams output directly from your
                  repo — keep your eyes on the app while agents run.
                </p>
              </div>
            </div>

            {/* Feature 3 — extension install */}
            <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12">
              <div className="w-full sm:w-[55%] shrink-0">
                <Image
                  src="/1.png"
                  alt="Chrome extension popup for Pier showing configuration options"
                  width={1280}
                  height={800}
                  className="w-full h-auto rounded-2xl border border-neutral-200 shadow-sm"
                />
              </div>
              <div className="w-full sm:w-[45%]">
                <span className="text-xs font-semibold text-emerald-500 tabular-nums">
                  03
                </span>
                <h3 className="text-xl sm:text-2xl font-medium text-neutral-900 mt-3 leading-snug">
                  Install once, activate everywhere
                </h3>
                <p className="mt-4 text-sm text-neutral-500 font-medium leading-relaxed">
                  Load the Chrome extension once via Developer mode. It
                  activates automatically on any{" "}
                  <code className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-xs">
                    *.localhost
                  </code>{" "}
                  page — no per-project configuration needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-medium text-emerald-600 uppercase tracking-widest">
            How It Works
          </p>
          <h2 className="text-2xl sm:text-3xl font-medium mt-4 text-neutral-900 max-w-xl leading-snug">
            One command. One tab. One terminal.
          </h2>

          <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                step: "01",
                title: "Register your project",
                desc: "Run pier myapp pnpm dev to wrap portless and record hostname → project path.",
              },
              {
                step: "02",
                title: "Bridge starts automatically",
                desc: "Pier ensures a local WebSocket bridge is running on 127.0.0.1. No cloud required.",
              },
              {
                step: "03",
                title: "Extension activates on localhost",
                desc: "The Chrome extension detects your *.localhost page and opens a WebSocket to the bridge.",
              },
              {
                step: "04",
                title: "Session routed to your repo",
                desc: "The bridge maps the hostname back to your codebase directory and opens a shell session.",
              },
              {
                step: "05",
                title: "Terminal renders inside your app",
                desc: "An xterm.js panel appears in your page. Press Cmd+` to toggle it at any time.",
              },
              {
                step: "06",
                title: "Context stays isolated",
                desc: "Each project gets isolated cookies and localStorage via portless — no port collisions.",
              },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                className="flex gap-4 p-6 rounded-2xl border border-neutral-200 bg-neutral-50"
              >
                <span className="text-sm font-semibold text-emerald-500 mt-0.5 shrink-0 tabular-nums">
                  {step}
                </span>
                <div>
                  <h3 className="font-medium text-neutral-900">{title}</h3>
                  <p className="mt-1.5 text-sm text-neutral-400 font-medium leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 bg-neutral-50">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-medium text-emerald-600 uppercase tracking-widest">
            Features
          </p>
          <h2 className="text-2xl sm:text-3xl font-medium mt-4 text-neutral-900 max-w-xl leading-snug">
            Everything you need. Nothing you don&apos;t.
          </h2>

          <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "Real terminal, in-page",
                desc: "Powered by xterm.js and a local shell bridge. A full PTY session — not a wrapper, not a mock.",
              },
              {
                title: "Hostname → codebase routing",
                desc: "Pier maps *.localhost hostnames to absolute paths so the right repo opens, automatically.",
              },
              {
                title: "Isolated storage",
                desc: "Portless gives each project its own cookies and localStorage without conflicting ports.",
              },
              {
                title: "Token-secured bridge",
                desc: "The local bridge requires an access token. Only your browser, only your machine.",
              },
              {
                title: "Agent-ready",
                desc: "Built for workflows where multiple AI agents run in parallel across repos and services.",
              },
              {
                title: "Zero cloud",
                desc: "Everything runs on 127.0.0.1. No accounts, no SaaS, no data leaving your machine.",
              },
            ].map(({ title, desc }) => (
              <div
                key={title}
                className="p-6 rounded-2xl border border-neutral-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors"
              >
                <h3 className="font-medium text-neutral-900">{title}</h3>
                <p className="mt-2 text-sm text-neutral-400 font-medium leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Install / CTA */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 bg-emerald-950">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-medium text-emerald-400 uppercase tracking-widest">
            Get Started
          </p>
          <h2 className="text-2xl sm:text-3xl font-medium mt-4 text-white max-w-xl leading-snug">
            Up and running in three commands
          </h2>
          <p className="mt-5 text-emerald-200/50 font-medium max-w-md text-sm sm:text-base">
            Install the CLI, run setup once, and you&apos;re ready. Then wrap
            any dev command with pier.
          </p>

          <div className="mt-10 sm:mt-12 space-y-2.5 max-w-xl">
            {[
              {
                cmd: "npm install -g portless @malviyahimanshu/pier",
                comment: "# install once",
              },
              { cmd: "pier setup", comment: "# start bridge, print token" },
              { cmd: "pier myapp pnpm dev", comment: "# open myapp.localhost" },
            ].map(({ cmd, comment }) => (
              <div
                key={cmd}
                className="flex items-center gap-3 bg-emerald-900/40 border border-emerald-800/50 rounded-xl px-4 sm:px-5 py-3.5 overflow-x-auto"
              >
                <span className="text-emerald-600 text-sm select-none shrink-0">
                  $
                </span>
                <code
                  className={cn(
                    "text-sm text-emerald-100 flex-1 whitespace-nowrap",
                    geistMono.className
                  )}
                >
                  {cmd}
                </code>
                <span
                  className={cn(
                    "text-xs text-emerald-600 shrink-0 hidden sm:block",
                    geistMono.className
                  )}
                >
                  {comment}
                </span>
              </div>
            ))}
          </div>

          {/* <div className="mt-10 flex items-center gap-3">
            <a
              href="https://github.com/malviyahimanshu/pier"
              className="bg-white text-emerald-950 hover:bg-white/90 text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
            >
              View on GitHub
            </a>
          </div> */}

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href="https://github.com/malviyahimanshu/pier"
              className="bg-white text-emerald-950 text-sm font-medium px-5 py-2.5 rounded-full hover:bg-white/90 transition-colors flex items-center gap-2"
            >
              <Image 
                src={'/chrome.png'}
                alt=""
                height={100}
                width={100}
                className="h-4 w-auto object-contain"
              />
              Download for Chrome
            </a>
            <a
              href="https://github.com/malviyahimanshu/pier"
              className="text-white text-sm font-medium px-5 py-2.5 rounded-full border border-white/40 opacity-80 hover:opacity-100 transition-all flex items-center gap-2"
            >
              <Image 
                src={'/github.png'}
                alt=""
                height={100}
                width={100}
                className="h-4 w-auto object-contain"
              />
              View on GitHub
            </a>
          </div>

          <p className="mt-5 text-white/50 text-sm font-medium">
            Requires Node.js 20+ · Chrome or Chromium (MV3)
          </p>
        </div>
      </section>

      {/* Footer */}
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
            <span className="text-white/20 text-sm font-medium">
              ISC License
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
