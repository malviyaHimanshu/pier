import { GITHUB_LINK } from "@/lib/constants";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for the Pier website, CLI, and browser extension."
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="relative py-14 sm:py-20 px-4 sm:px-6 bg-linear-to-b from-emerald-950 to-emerald-700 ">
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
              </div>
            </Link>

            <div className="text-white/70 text-sm">
              <Link href="/docs">
                <p className="py-1.5 px-3 font-medium hover:bg-white/10 rounded-full transition-all">
                  Docs
                </p>
              </Link>
            </div>
          </div>
        </header>

        <div className="relative w-full max-w-4xl mx-auto mt-14 sm:mt-20">
          <p className="text-xs font-medium text-emerald-400 uppercase tracking-widest">
            Legal
          </p>
          <h1 className="text-3xl sm:text-4xl font-medium text-white leading-tight mt-4">
            Privacy Policy
          </h1>
          <p className="mt-5 text-sm sm:text-base font-medium text-white/80 max-w-xl leading-relaxed">
            This policy explains what data Pier collects, how it is used, and
            what controls you have.
          </p>
          <p className="mt-4 text-xs sm:text-sm font-medium text-white/65">
            Last updated: February 26, 2026
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 py-10 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8 sm:space-y-10">
            <section>
              <h2 className="text-lg font-medium text-neutral-900">
                What We Collect
              </h2>
              <p className="mt-3 text-sm sm:text-base font-medium text-neutral-500 leading-relaxed">
                Pier is designed to run locally. The website does not require
                account creation. The CLI, bridge, and extension store
                configuration data on your machine (such as host-to-workspace
                mappings, bridge settings, and local session metadata) so Pier
                can route terminals correctly. On production website domains,
                Pier also collects website pageview analytics with PostHog.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-neutral-900">
                How Data Is Used
              </h2>
              <p className="mt-3 text-sm sm:text-base font-medium text-neutral-500 leading-relaxed">
                Stored local data is used only to provide product functionality:
                starting the local bridge, authenticating local requests, and
                opening terminal sessions in the mapped project directory.
                Website analytics data is used to understand documentation and
                landing-page usage trends.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-neutral-900">
                Website Analytics (PostHog)
              </h2>
              <p className="mt-3 text-sm sm:text-base font-medium text-neutral-500 leading-relaxed">
                Pier website analytics uses PostHog and is limited to pageview
                events. Autocapture, session recording, and person profiles are
                disabled. Analytics is enabled only on approved production
                hostnames.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-neutral-900">
                Data Sharing
              </h2>
              <p className="mt-3 text-sm sm:text-base font-medium text-neutral-500 leading-relaxed">
                PostHog processes website analytics events for Pier. Pier does
                not send terminal output, workspace paths, bridge tokens, or
                CLI/extension runtime data to PostHog. If you install from
                third-party platforms such as GitHub or the Chrome Web Store,
                those services may collect their own usage data under their own
                policies.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-neutral-900">Security</h2>
              <p className="mt-3 text-sm sm:text-base font-medium text-neutral-500 leading-relaxed">
                The local bridge listens on localhost and expects an access
                token from trusted clients. You are responsible for securing
                your development machine and rotating credentials if they are
                exposed.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-neutral-900">
                Your Controls
              </h2>
              <p className="mt-3 text-sm sm:text-base font-medium text-neutral-500 leading-relaxed">
                You can remove local Pier data at any time by deleting Pier
                config files, host mappings, and extension storage from your
                machine. You can also uninstall the CLI and extension to stop
                all processing.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-neutral-900">
                Changes to This Policy
              </h2>
              <p className="mt-3 text-sm sm:text-base font-medium text-neutral-500 leading-relaxed">
                This policy may be updated as Pier evolves. Material updates
                will be reflected by updating the date at the top of this page.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium text-neutral-900">Contact</h2>
              <p className="mt-3 text-sm sm:text-base font-medium text-neutral-500 leading-relaxed">
                For privacy questions, open an issue in the Pier repository on
                GitHub.
              </p>
            </section>
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
              href={GITHUB_LINK}
              className="text-sm text-neutral-400 hover:text-neutral-500 font-medium transition-colors"
            >
              GitHub
            </a>
            <Link
              href="/docs"
              className="text-sm text-neutral-400 hover:text-neutral-500 font-medium transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-neutral-600 hover:text-neutral-500 font-medium transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-neutral-400 text-sm font-medium">
              ISC License
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
