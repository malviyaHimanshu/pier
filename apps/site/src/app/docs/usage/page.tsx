import type { Metadata } from "next";
import {
  DocsPageShell,
  CommandBlock,
  InlineCode
} from "../_components/docs-page-shell";
import { requireDocBySlug } from "@/lib/docs";

const doc = requireDocBySlug("usage");

export const metadata: Metadata = {
  title: doc.title,
  description: doc.description
};

export default function UsageDocsPage() {
  return (
    <DocsPageShell slug="usage">
      <h2 className="text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        Start an App with Portless + Pier Mapping
      </h2>
      <p className="text-neutral-600 leading-relaxed">
        From the project directory you want the terminal to use:
      </p>
      <CommandBlock>{"pier myapp pnpm dev"}</CommandBlock>
      <p className="text-neutral-600 leading-relaxed">This will:</p>
      <ul className="list-disc pl-5 space-y-2 text-neutral-600">
        <li>
          register <InlineCode>myapp.localhost</InlineCode> to current working
          directory
        </li>
        <li>ensure the Pier bridge is running</li>
        <li>run portless with your dev command</li>
      </ul>

      <h2 className="mt-10 text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        Multiple Apps in Parallel
      </h2>
      <CommandBlock>
        {"pier web pnpm dev\npier api pnpm dev\npier admin pnpm dev"}
      </CommandBlock>
      <p className="text-neutral-600 leading-relaxed">Each app gets:</p>
      <ul className="list-disc pl-5 space-y-2 text-neutral-600">
        <li>its own hostname under *.localhost</li>
        <li>separate browser storage isolation via portless</li>
        <li>a Pier terminal rooted in the mapped repo directory</li>
      </ul>

      <h2 className="mt-10 text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        Mapping Commands
      </h2>
      <CommandBlock>
        {
          "pier map list\npier map add docs.localhost /path/to/docs-repo\npier map remove docs.localhost\npier map where docs.localhost"
        }
      </CommandBlock>

      <h2 className="mt-10 text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        Bridge Commands
      </h2>
      <CommandBlock>
        {
          "pier bridge start\npier bridge start --foreground\npier bridge stop\npier bridge status\npier bridge logs"
        }
      </CommandBlock>

      <h2 className="mt-10 text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        Diagnostics
      </h2>
      <CommandBlock>{"pier doctor"}</CommandBlock>
      <p className="text-neutral-600 leading-relaxed">
        <InlineCode>pier doctor</InlineCode> prints bridge state, config paths,
        and extension connection values.
      </p>
    </DocsPageShell>
  );
}
