import type { Metadata } from "next";
import {
  DocsPageShell,
  CommandBlock,
  InlineCode
} from "../_components/docs-page-shell";
import { requireDocBySlug } from "@/lib/docs";
import { EXTENSION_LINK } from "@/lib/constants";

const doc = requireDocBySlug("setup");

export const metadata: Metadata = {
  title: doc.title,
  description: doc.description
};

export default function SetupDocsPage() {
  return (
    <DocsPageShell slug="setup">
      <h2 className="text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        Install (Published Package)
      </h2>
      <CommandBlock>{"npm install -g @malviyahimanshu/pier"}</CommandBlock>

      <h2 className="mt-10 text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        Initialize Pier
      </h2>
      <CommandBlock>{"pier setup"}</CommandBlock>
      <p className="text-neutral-600 leading-relaxed">
        <InlineCode>pier setup</InlineCode> creates{" "}
        <InlineCode>~/.pier/config.json</InlineCode> if missing, starts the
        local bridge server, starts the Portless proxy, and prints the WebSocket
        URL and token for the extension.
      </p>
      <p className="text-neutral-600 leading-relaxed">
        Use <InlineCode>pier setup --manual-extension</InlineCode> if you want
        setup to cache the unpacked extension bundle for manual loading.
      </p>

      <h2 className="mt-10 text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        Install Extension (Recommended)
      </h2>
      <p className="text-neutral-600 leading-relaxed">
        Install Pier from the Chrome Web Store:{" "}
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
        Manual Unpacked Extension (Optional)
      </h2>
      <CommandBlock>
        {"pier extension install\npier extension path"}
      </CommandBlock>
      <ol className="list-decimal pl-5 space-y-2 text-neutral-600">
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
        Open Pier Settings and paste the WebSocket URL and access token from
        setup. Use Test Bridge before opening localhost pages.
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
        <li>
          Open your localhost URL and press Ctrl+` on macOS or Ctrl+` on
          Windows/Linux
        </li>
        <li>Confirm terminal opens in the mapped project directory</li>
      </ol>
    </DocsPageShell>
  );
}
