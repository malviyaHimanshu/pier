export type DocSlug =
  | "setup"
  | "usage"
  | "configuration"
  | "troubleshooting"
  | "architecture"
  | "contributing"
  | "release";

export interface DocEntry {
  slug: DocSlug;
  title: string;
  description: string;
}

export const docsPages: DocEntry[] = [
  {
    slug: "setup",
    title: "Setup",
    description: "Install Pier, load the extension, and validate your first run."
  },
  {
    slug: "usage",
    title: "Usage",
    description: "Run apps with host mapping, bridge commands, and diagnostics."
  },
  {
    slug: "configuration",
    title: "Configuration",
    description: "Understand Pier config files, local state, and bridge environment variables."
  },
  {
    slug: "troubleshooting",
    title: "Troubleshooting",
    description: "Fix common setup, mapping, bridge, and terminal issues quickly."
  },
  {
    slug: "architecture",
    title: "Architecture",
    description: "See how CLI, bridge, extension, and terminal rendering fit together."
  },
  {
    slug: "contributing",
    title: "Contributing",
    description: "Local development workflow, expectations, and source-of-truth guidance."
  },
  {
    slug: "release",
    title: "Release",
    description: "Build release artifacts and publish to npm and Chrome Web Store."
  }
];

export function requireDocBySlug(slug: DocSlug): DocEntry {
  const page = docsPages.find((doc) => doc.slug === slug);
  if (!page) {
    throw new Error(`Unknown doc slug: ${slug}`);
  }
  return page;
}

export function getDocNeighbors(slug: DocSlug): {
  previous: DocEntry | null;
  next: DocEntry | null;
} {
  const index = docsPages.findIndex((doc) => doc.slug === slug);

  if (index === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: index > 0 ? docsPages[index - 1] : null,
    next: index < docsPages.length - 1 ? docsPages[index + 1] : null
  };
}
