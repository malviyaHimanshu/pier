import type { Metadata } from "next";
import {
  DocsPageShell,
  CommandBlock,
  InlineCode
} from "../_components/docs-page-shell";
import { requireDocBySlug } from "@/lib/docs";
import { EXTENSION_LINK } from "@/lib/constants";

const doc = requireDocBySlug("troubleshooting");

export const metadata: Metadata = {
  title: doc.title,
  description: doc.description
};

export default function TroubleshootingDocsPage() {
  return (
    <DocsPageShell slug="troubleshooting">
      <h2 className="text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        Portless Not Found
      </h2>
      <p className="text-neutral-600 leading-relaxed">
        Symptom: <InlineCode>pier</InlineCode> fails to start an app command and
        mentions portless.
      </p>
      <CommandBlock>{"npm install -g @malviyahimanshu/pier"}</CommandBlock>

      <h2 className="mt-10 text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        Bridge Unreachable in Extension
      </h2>
      <ol className="list-decimal pl-5 space-y-2 text-neutral-600">
        <li>
          Run <InlineCode>pier bridge status</InlineCode>
        </li>
        <li>
          Run <InlineCode>pier doctor</InlineCode>
        </li>
        <li>Confirm extension WebSocket URL and token match setup output</li>
        <li>Use Test Bridge in extension settings</li>
      </ol>

      <h2 className="mt-10 text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        Token Errors or Authentication Failures
      </h2>
      <ul className="list-disc pl-5 space-y-2 text-neutral-600">
        <li>
          Re-read token from pier doctor and paste it again in extension
          settings
        </li>
        <li>Reload localhost tabs after saving settings</li>
      </ul>

      <h2 className="mt-10 text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        Terminal Opens in Wrong Directory
      </h2>
      <p className="text-neutral-600 leading-relaxed">Inspect mappings:</p>
      <CommandBlock>
        {"pier map list\npier map where myapp.localhost"}
      </CommandBlock>
      <p className="text-neutral-600 leading-relaxed">
        Re-add mapping if needed:
      </p>
      <CommandBlock>
        {"pier map add myapp.localhost /correct/path"}
      </CommandBlock>

      <h2 className="mt-10 text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        node-pty or Terminal Spawn Issues
      </h2>
      <p className="text-neutral-600 leading-relaxed">
        Pier falls back to child_process pipes when PTY initialization fails,
        but interactive behavior may be reduced.
      </p>
      <ul className="list-disc pl-5 space-y-2 text-neutral-600">
        <li>
          Check <InlineCode>pier bridge logs</InlineCode>
        </li>
        <li>
          Check <InlineCode>pier doctor</InlineCode>
        </li>
        <li>Confirm shell path in config (bridge.shell) is valid</li>
      </ul>

      <h2 className="mt-10 text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        Extension Loads But Shortcut Does Nothing
      </h2>
      <ul className="list-disc pl-5 space-y-2 text-neutral-600">
        <li>Confirm page host is localhost, 127.0.0.1, ::1, or *.localhost</li>
        <li>Check extension is enabled</li>
        <li>Reload the page after updating extension settings</li>
      </ul>
      <p className="text-neutral-600 leading-relaxed">
        Install/reinstall from Chrome Web Store if needed:{" "}
        <a
          href={EXTENSION_LINK}
          className="underline underline-offset-2"
          target="_blank"
          rel="noreferrer"
        >
          {EXTENSION_LINK}
        </a>
      </p>

      <h2 className="mt-10 text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        Manual Extension Bundle Install Fails
      </h2>
      <CommandBlock>{"pier extension install"}</CommandBlock>
      <p className="text-neutral-600 leading-relaxed">
        If you have a local ZIP + checksum:
      </p>
      <CommandBlock>
        {"pier extension install --from /path/to/pier-extension-v<version>.zip"}
      </CommandBlock>
    </DocsPageShell>
  );
}
