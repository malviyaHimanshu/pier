import type { Metadata } from "next";
import {
  DocsPageShell,
  CommandBlock,
  InlineCode
} from "../_components/docs-page-shell";
import { requireDocBySlug } from "@/lib/docs";

const doc = requireDocBySlug("contributing");

export const metadata: Metadata = {
  title: doc.title,
  description: doc.description
};

export default function ContributingDocsPage() {
  return (
    <DocsPageShell slug="contributing">
      <h2 className="text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        Prerequisites
      </h2>
      <ul className="list-disc pl-5 space-y-2 text-neutral-600">
        <li>Node.js 20+</li>
        <li>pnpm 10+</li>
        <li>Chrome/Chromium for extension testing</li>
      </ul>

      <h2 className="mt-10 text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        Source of Truth vs Generated Output
      </h2>
      <ul className="list-disc pl-5 space-y-2 text-neutral-600">
        <li>
          Author extension code in{" "}
          <InlineCode>packages/extension-src</InlineCode>
        </li>
        <li>
          Do not edit files in <InlineCode>extension/</InlineCode> directly
        </li>
        <li>
          <InlineCode>extension/</InlineCode> is generated build output (ignored
          in git)
        </li>
        <li>
          Node package runtime output lives in{" "}
          <InlineCode>packages/*/dist</InlineCode> (ignored in git)
        </li>
      </ul>

      <h2 className="mt-10 text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        Local Setup
      </h2>
      <CommandBlock>
        {"pnpm install\npnpm run build\npnpm run check"}
      </CommandBlock>

      <h2 className="mt-10 text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        Common Commands
      </h2>
      <ul className="list-disc pl-5 space-y-2 text-neutral-600">
        <li>
          <InlineCode>pnpm run build</InlineCode>: compile packages, build
          extension, sync manifest
        </li>
        <li>
          <InlineCode>pnpm run typecheck</InlineCode>: TypeScript checks
        </li>
        <li>
          <InlineCode>pnpm run lint</InlineCode>: ESLint across JS/TS/TSX
        </li>
        <li>
          <InlineCode>pnpm run test:unit</InlineCode>: package build and Vitest
          suite
        </li>
        <li>
          <InlineCode>pnpm run test:smoke</InlineCode>: smoke validation for
          built assets and CLI shims
        </li>
        <li>
          <InlineCode>pnpm run test:pack-smoke</InlineCode>: tarball install
          smoke test
        </li>
      </ul>

      <h2 className="mt-10 text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        Contribution Expectations
      </h2>
      <ul className="list-disc pl-5 space-y-2 text-neutral-600">
        <li>Preserve CLI command and flag compatibility for v1.x</li>
        <li>Preserve config and workspace registry format compatibility</li>
        <li>Preserve extension storage key migration behavior</li>
        <li>Keep PRs focused and include tests for behavior changes</li>
      </ul>
    </DocsPageShell>
  );
}
