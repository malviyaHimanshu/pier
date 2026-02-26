import type { Metadata } from "next";
import {
  DocsPageShell,
  CommandBlock,
  InlineCode
} from "../_components/docs-page-shell";
import { requireDocBySlug } from "@/lib/docs";

const doc = requireDocBySlug("release");

export const metadata: Metadata = {
  title: doc.title,
  description: doc.description
};

export default function ReleaseDocsPage() {
  return (
    <DocsPageShell slug="release">
      <h2 className="text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        Release Artifacts
      </h2>
      <p className="text-neutral-600 leading-relaxed">
        This repo ships two artifacts:
      </p>
      <ul className="list-disc pl-5 space-y-2 text-neutral-600">
        <li>
          npm package: <InlineCode>@malviyahimanshu/pier</InlineCode>
        </li>
        <li>Chrome Web Store upload ZIP for the built extension bundle</li>
      </ul>

      <h2 className="mt-10 text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        Release Prerequisites
      </h2>
      <ol className="list-decimal pl-5 space-y-2 text-neutral-600">
        <li>npm owner access for @malviyahimanshu/pier</li>
        <li>npm account 2FA enabled</li>
        <li>Chrome Web Store developer account</li>
        <li>Clean working tree recommended</li>
        <li>
          Version bumped in package.json (and changesets/changelog if used)
        </li>
      </ol>

      <h2 className="mt-10 text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        One-command Artifact Build
      </h2>
      <CommandBlock>{"pnpm install\npnpm run release:artifacts"}</CommandBlock>
      <p className="text-neutral-600 leading-relaxed">Artifacts produced:</p>
      <ul className="list-disc pl-5 space-y-2 text-neutral-600">
        <li>
          <InlineCode>{"./malviyahimanshu-pier-<version>.tgz"}</InlineCode>
        </li>
        <li>
          <InlineCode>
            {
              "./artifacts/chrome-web-store/pier-extension-chrome-web-store-v<version>.zip"
            }
          </InlineCode>
        </li>
        <li>
          <InlineCode>
            {
              "./artifacts/chrome-web-store/pier-extension-chrome-web-store-v<version>.zip.sha256"
            }
          </InlineCode>
        </li>
      </ul>

      <h2 className="mt-10 text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        npm Publish (Manual)
      </h2>
      <CommandBlock>
        {"pnpm run release:npm:dry-run\nnpm publish --access public"}
      </CommandBlock>
      <p className="text-neutral-600 leading-relaxed">
        Best practice: publish from a tagged commit and verify with{" "}
        <InlineCode>npm view @malviyahimanshu/pier version</InlineCode>.
      </p>

      <h2 className="mt-10 text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        npm Publish (GitHub Actions)
      </h2>
      <ul className="list-disc pl-5 space-y-2 text-neutral-600">
        <li>
          Tag release commit:{" "}
          <InlineCode>{"git tag vX.Y.Z && git push origin vX.Y.Z"}</InlineCode>
        </li>
        <li>Add NPM_TOKEN in repository secrets</li>
        <li>
          Workflow publishes with provenance and uploads release artifacts
        </li>
      </ul>

      <h2 className="mt-10 text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        Chrome Web Store Publish
      </h2>
      <ol className="list-decimal pl-5 space-y-2 text-neutral-600">
        <li>Run release artifacts command</li>
        <li>Open Chrome Web Store Developer Dashboard</li>
        <li>Upload extension ZIP from artifacts path</li>
        <li>Complete listing and privacy disclosures</li>
        <li>Submit for review and rollout</li>
      </ol>

      <h2 className="mt-10 text-2xl sm:text-3xl font-medium text-neutral-900 leading-tight">
        Quick Validation Commands
      </h2>
      <CommandBlock>
        {
          "pnpm run build\npnpm run check\npnpm run pack:npm\npnpm run test:pack-smoke\npnpm run pack:extension"
        }
      </CommandBlock>
    </DocsPageShell>
  );
}
