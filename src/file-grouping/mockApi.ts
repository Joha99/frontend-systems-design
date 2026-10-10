/**
 * Mock file-system API for the File Browser with Grouping problem.
 *
 * The server stores a FLAT list of entries. Folders are mostly implied by
 * file paths ("src/ui/Button.tsx" implies "src" and "src/ui"); only empty
 * folders are sent as explicit folder entries. Entries arrive in random
 * order, so a child can come before its parent.
 *
 * Don't change this file; build on top of it.
 */

export interface FileEntry {
  id: string;
  /** Normalized: no leading or trailing slash, "/" separated. */
  path: string;
  type: "file" | "folder";
  /** Bytes. Always 0 for folders: work out folder sizes yourself. */
  size: number;
  /** ISO string. */
  modifiedAt: string;
}

export type FileEvent =
  | { type: "created"; entry: FileEntry }
  | { type: "modified"; id: string; size: number; modifiedAt: string }
  /** A rename is a move within the same folder. */
  | { type: "moved"; id: string; newPath: string }
  | { type: "deleted"; id: string };

const FAILURE_RATE = 0.2;
const DAY = 24 * 60 * 60 * 1000;

// Edge cases on purpose: "util" vs "utils" (prefix names), the same file
// name in different folders, file1 / file2 / file10 (natural sort),
// dotfiles and files with no extension, deep nesting, root-level files.
const FILE_PATHS = [
  "README.md",
  "package.json",
  "tsconfig.json",
  ".gitignore",
  ".env.example",
  "Makefile",
  "LICENSE",
  "src/main.tsx",
  "src/App.tsx",
  "src/App.module.css",
  "src/index.css",
  "src/components/Button.tsx",
  "src/components/Button.module.css",
  "src/components/Button.test.tsx",
  "src/components/Modal.tsx",
  "src/components/Modal.module.css",
  "src/components/forms/Input.tsx",
  "src/components/forms/Select.tsx",
  "src/components/forms/Checkbox.tsx",
  "src/components/forms/index.ts",
  "src/components/index.ts",
  "src/hooks/useDebounce.ts",
  "src/hooks/useFetch.ts",
  "src/hooks/index.ts",
  "src/util/format.ts",
  "src/utils/date.ts",
  "src/utils/date.test.ts",
  "src/utils/index.ts",
  "src/pages/home/Home.tsx",
  "src/pages/home/Home.module.css",
  "src/pages/settings/Settings.tsx",
  "src/pages/settings/account/Account.tsx",
  "src/pages/settings/account/Avatar.tsx",
  "src/pages/settings/account/deep/deeper/deepest/Note.md",
  "public/favicon.ico",
  "public/robots.txt",
  "public/images/hero.png",
  "public/images/logo.svg",
  "public/images/team/alex.jpg",
  "public/images/team/sam.jpg",
  "public/images/team/jordan.jpg",
  "public/fonts/Inter-Regular.woff2",
  "public/fonts/Inter-Bold.woff2",
  "docs/README.md",
  "docs/architecture.md",
  "docs/diagrams/overview.png",
  "docs/diagrams/data-flow.png",
  "docs/meeting-notes/notes1.md",
  "docs/meeting-notes/notes2.md",
  "docs/meeting-notes/notes10.md",
  "docs/meeting-notes/notes11.md",
  "docs/meeting-notes/notes3.md",
  "docs/specs/Q3-roadmap.pdf",
  "docs/specs/pricing.xlsx",
  "assets/video/intro.mp4",
  "assets/video/demo.mov",
  "assets/audio/click.mp3",
  "assets/archive/old-site.zip",
  "assets/archive/backup-2025.tar.gz",
  "scripts/build.sh",
  "scripts/deploy.sh",
  "scripts/seed.py",
  "data/users.json",
  "data/orders.csv",
  "data/empty.txt",
];

/** Empty folders: these are the only folders sent explicitly. */
const EMPTY_FOLDER_PATHS = ["tmp", "src/components/legacy", "docs/drafts"];

// Days ago. Picked so every date group in Part 2 has something in it.
const DAYS_AGO = [
  0, 0, 0, 1, 1, 3, 5, 6, 9, 15, 22, 29, 45, 70, 120, 200, 400, 800,
];

/** Tiny seeded PRNG so the data is the same on every load. */
let seed = 42;
const random = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

const sizeFor = (path: string) => {
  if (path.endsWith("empty.txt")) return 0;
  if (/\.(mp4|mov|zip|gz)$/.test(path)) return Math.floor(5e6 + random() * 2e8);
  if (/\.(png|jpg|pdf|xlsx|woff2|mp3)$/.test(path))
    return Math.floor(2e4 + random() * 2e6);
  return Math.floor(200 + random() * 40_000);
};

const now = Date.now();
const timeAgo = () => {
  const days = DAYS_AGO[Math.floor(random() * DAYS_AGO.length)];
  return new Date(
    now - days * DAY - random() * 6 * 60 * 60 * 1000,
  ).toISOString();
};

let nextId = 1;
const newId = () => `e${nextId++}`;

const db: FileEntry[] = [
  ...FILE_PATHS.map((path) => ({
    id: newId(),
    path,
    type: "file" as const,
    size: sizeFor(path),
    modifiedAt: timeAgo(),
  })),
  ...EMPTY_FOLDER_PATHS.map((path) => ({
    id: newId(),
    path,
    type: "folder" as const,
    size: 0,
    modifiedAt: timeAgo(),
  })),
];

const delay = (min = 300, max = 900) =>
  new Promise((resolve) =>
    setTimeout(resolve, min + Math.random() * (max - min)),
  );

const shuffled = <T>(items: T[]) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

/** All entries, flat, in random order. Rejects ~20% of the time. */
export async function fetchEntries(): Promise<FileEntry[]> {
  await delay();
  if (Math.random() < FAILURE_RATE) {
    throw new Error("Failed to load files. Please try again.");
  }
  return shuffled(db).map((entry) => ({ ...entry }));
}

// ---------------------------------------------------------------------------
// Part 4: live updates
// ---------------------------------------------------------------------------

const NEW_FILE_NAMES = [
  "todo.md",
  "scratch.ts",
  "photo.jpg",
  "report.pdf",
  "clip.mp4",
  "notes.txt",
];

const parentOf = (path: string) => path.split("/").slice(0, -1).join("/");
const nameOf = (path: string) => path.split("/").pop()!;

const randomEvent = (): FileEvent | null => {
  const files = db.filter((e) => e.type === "file");
  if (files.length === 0) return null;
  const file = files[Math.floor(random() * files.length)];
  const roll = random();

  if (roll < 0.35) {
    file.size = sizeFor(file.path);
    file.modifiedAt = new Date().toISOString();
    return {
      type: "modified",
      id: file.id,
      size: file.size,
      modifiedAt: file.modifiedAt,
    };
  }

  if (roll < 0.55) {
    const folders = [...new Set(files.map((f) => parentOf(f.path)))];
    const folder = folders[Math.floor(random() * folders.length)];
    const name = `${Date.now() % 1000}-${NEW_FILE_NAMES[Math.floor(random() * NEW_FILE_NAMES.length)]}`;
    const path = folder ? `${folder}/${name}` : name;
    const entry: FileEntry = {
      id: newId(),
      path,
      type: "file",
      size: sizeFor(path),
      modifiedAt: new Date().toISOString(),
    };
    db.push(entry);
    return { type: "created", entry: { ...entry } };
  }

  if (roll < 0.8) {
    // Move to another folder (sometimes into a brand-new folder that
    // doesn't exist yet), or rename in place.
    const folders = [
      ...new Set(files.map((f) => parentOf(f.path))),
      "archive/2026",
    ];
    const target =
      random() < 0.3
        ? parentOf(file.path)
        : folders[Math.floor(random() * folders.length)];
    const name =
      random() < 0.3 ? `renamed-${nameOf(file.path)}` : nameOf(file.path);
    file.path = target ? `${target}/${name}` : name;
    return { type: "moved", id: file.id, newPath: file.path };
  }

  db.splice(db.indexOf(file), 1);
  return { type: "deleted", id: file.id };
};

/**
 * Pushes file events every 1.5–3s. About 1 in 8 ticks is a burst of 25
 * events at once (like a `git checkout`). Returns an unsubscribe function.
 */
export function subscribeToFileEvents(
  onEvent: (event: FileEvent) => void,
): () => void {
  let timer: ReturnType<typeof setTimeout>;
  let active = true;

  const tick = () => {
    const count = Math.random() < 0.125 ? 25 : 1;
    for (let i = 0; i < count && active; i++) {
      const event = randomEvent();
      if (event) onEvent(event);
    }
    if (active) timer = setTimeout(tick, 1500 + Math.random() * 1500);
  };
  timer = setTimeout(tick, 1500);

  return () => {
    active = false;
    clearTimeout(timer);
  };
}
