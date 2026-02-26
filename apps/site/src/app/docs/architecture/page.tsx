import type { Metadata } from "next";
import { DocsPageShell, InlineCode } from "../_components/docs-page-shell";
import { requireDocBySlug } from "@/lib/docs";

const doc = requireDocBySlug("architecture");

export const metadata: Metadata = {
  title: doc.title,
  description: doc.description
};

export default function ArchitectureDocsPage() {
  return (
    <DocsPageShell slug="architecture">
      <h2 className="text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        Runtime Flow
      </h2>
      <ol className="list-decimal pl-5 space-y-2 text-neutral-600">
        <li>
          <InlineCode>{"pier <name> <cmd...>"}</InlineCode> wraps portless and
          records <InlineCode>{"<name>.localhost -> cwd"}</InlineCode>
        </li>
        <li>CLI ensures the bridge process is running</li>
        <li>
          <InlineCode>pier setup</InlineCode> ensures the Portless proxy is
          running and prints bridge connection details for the extension
        </li>
        <li>
          Extension content script activates only on localhost-style pages
        </li>
        <li>
          Content script opens WebSocket /terminal with token and page context
        </li>
        <li>Bridge resolves the page hostname using the workspace registry</li>
        <li>
          Bridge creates or reuses shell session (node-pty with pipe fallback)
        </li>
        <li>xterm.js renders terminal output in-page</li>
      </ol>

      <h2 className="mt-10 text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        Repository Structure
      </h2>
      <ul className="list-disc pl-5 space-y-2 text-neutral-600">
        <li>
          <InlineCode>packages/shared</InlineCode>: shared constants, settings
          normalization, and WebSocket protocol helpers
        </li>
        <li>
          <InlineCode>packages/cli-core</InlineCode>: CLI commands, config
          store, workspace routing registry
        </li>
        <li>
          <InlineCode>packages/bridge-core</InlineCode>: bridge HTTP/WebSocket
          server and shell session management
        </li>
        <li>
          <InlineCode>packages/extension-src</InlineCode>: extension source and
          static assets
        </li>
        <li>
          <InlineCode>extension/</InlineCode>: generated unpacked extension
          output
        </li>
        <li>
          <InlineCode>cli/</InlineCode>, <InlineCode>server/</InlineCode>, and{" "}
          <InlineCode>bin/</InlineCode>: JS shims loading compiled dist output
        </li>
      </ul>

      <h2 className="mt-10 text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        Extension Build Pipeline
      </h2>
      <p className="text-neutral-600 leading-relaxed">
        <InlineCode>pnpm run build:extension</InlineCode> bundles the shared
        runtime, content script, options UI, copies static extension assets, and
        removes stale vendored JS.
      </p>

      <h2 className="mt-10 text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        Packaging Model
      </h2>
      <ul className="list-disc pl-5 space-y-2 text-neutral-600">
        <li>
          Published package is a single npm package:{" "}
          <InlineCode>@malviyahimanshu/pier</InlineCode>
        </li>
        <li>Chrome Web Store extension is the primary user install path</li>
        <li>
          <InlineCode>pier extension install</InlineCode> remains available for
          manual unpacked workflows
        </li>
        <li>Internal packages are implementation details</li>
        <li>
          <InlineCode>prepack</InlineCode> runs build and checks so published
          tarballs include compiled dist files and release packaging can produce
          extension ZIP artifacts
        </li>
      </ul>
    </DocsPageShell>
  );
}
