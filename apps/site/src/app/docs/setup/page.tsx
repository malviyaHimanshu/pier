import type { Metadata } from "next";
import { DocsPageShell, CommandBlock, InlineCode } from "../_components/docs-page-shell";
import { requireDocBySlug } from "@/lib/docs";

const doc = requireDocBySlug("setup");

export const metadata: Metadata = {
  title: doc.title,
  description: doc.description
};

export default function SetupDocsPage() {
  return (
    <DocsPageShell slug="setup">
      <h2 className="text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">Install (Published Package)</h2>
      <CommandBlock>{"npm install -g portless @malviyahimanshu/pier"}</CommandBlock>

      <h2 className="mt-10 text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">Initialize Pier</h2>
      <CommandBlock>{"pier setup"}</CommandBlock>
      <p className="text-neutral-600 leading-relaxed">
        <InlineCode>pier setup</InlineCode> creates <InlineCode>~/.pier/config.json</InlineCode> if
        missing, starts the local bridge server, and prints the WebSocket URL and token for
        the extension.
      </p>

      <h2 className="mt-10 text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        Load the Chrome/Chromium Extension
      </h2>
      <ol className="list-decimal pl-5 space-y-2 text-neutral-600">
        <li>
          Run <InlineCode>pier extension path</InlineCode>
        </li>
        <li>
          Open <InlineCode>chrome://extensions</InlineCode>
        </li>
        <li>Enable Developer mode</li>
        <li>Click Load unpacked and select the printed directory</li>
      </ol>

      <h2 className="mt-10 text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        Configure Extension Settings
      </h2>
      <p className="text-neutral-600 leading-relaxed">
        Open Pier Settings and paste the WebSocket URL and access token from setup. Use Test
        Bridge before opening localhost pages.
      </p>

      <h2 className="mt-10 text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        First-run Validation
      </h2>
      <ol className="list-decimal pl-5 space-y-2 text-neutral-600">
        <li>
          Verify <InlineCode>pier bridge status</InlineCode> reports running
        </li>
        <li>
          Start an app with <InlineCode>pier myapp pnpm dev</InlineCode>
        </li>
        <li>Open your localhost URL and press Cmd+` / Ctrl+`</li>
        <li>Confirm terminal opens in the mapped project directory</li>
      </ol>
    </DocsPageShell>
  );
}
