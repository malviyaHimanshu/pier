import type { Metadata } from "next";
import { DocsPageShell, InlineCode } from "../_components/docs-page-shell";
import { requireDocBySlug } from "@/lib/docs";

const doc = requireDocBySlug("configuration");

export const metadata: Metadata = {
  title: doc.title,
  description: doc.description
};

export default function ConfigurationDocsPage() {
  return (
    <DocsPageShell slug="configuration">
      <h2 className="text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        State Directory
      </h2>
      <p className="text-neutral-600 leading-relaxed">
        Pier stores local state in:
      </p>
      <ul className="list-disc pl-5 space-y-2 text-neutral-600">
        <li>
          <InlineCode>~/.pier/config.json</InlineCode>
        </li>
        <li>
          <InlineCode>~/.pier/bridge.pid</InlineCode>
        </li>
        <li>
          <InlineCode>~/.pier/bridge.log</InlineCode>
        </li>
        <li>
          <InlineCode>~/.pier/workspace-routes.json</InlineCode> (default
          mapping registry)
        </li>
      </ul>

      <h2 className="mt-10 text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        Config File (~/.pier/config.json)
      </h2>
      <p className="text-neutral-600 leading-relaxed">
        Pier normalizes and maintains this file automatically.
      </p>
      <p className="text-neutral-600 leading-relaxed">
        High-level shape includes:
      </p>
      <ul className="list-disc pl-5 space-y-2 text-neutral-600">
        <li>version</li>
        <li>createdAt</li>
        <li>updatedAt</li>
        <li>bridge.host</li>
        <li>bridge.port</li>
        <li>bridge.token</li>
        <li>bridge.defaultCwd</li>
        <li>bridge.shell</li>
        <li>bridge.workspaceRouteMapPath</li>
      </ul>

      <h2 className="mt-10 text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        Environment Variables (Bridge)
      </h2>
      <p className="text-neutral-600 leading-relaxed">
        Bridge runtime consumes:
      </p>
      <ul className="list-disc pl-5 space-y-2 text-neutral-600">
        <li>
          <InlineCode>PIER_HOST</InlineCode>
        </li>
        <li>
          <InlineCode>PIER_PORT</InlineCode>
        </li>
        <li>
          <InlineCode>PIER_TOKEN</InlineCode>
        </li>
        <li>
          <InlineCode>PIER_CWD</InlineCode>
        </li>
        <li>
          <InlineCode>PIER_SHELL</InlineCode>
        </li>
        <li>
          <InlineCode>PIER_WORKSPACE_ROUTE_MAP</InlineCode>
        </li>
        <li>
          <InlineCode>PIER_SESSION_DETACH_TIMEOUT_MS</InlineCode>
        </li>
      </ul>

      <h2 className="mt-10 text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        Extension Settings
      </h2>
      <p className="text-neutral-600 leading-relaxed">
        Pier stores terminal rendering and connection settings in extension
        storage keys.
      </p>
      <p className="text-neutral-600 leading-relaxed">
        Compatibility note: older storage keys are migrated automatically on
        load.
      </p>
    </DocsPageShell>
  );
}
