/**
 * Mock photo API for the Responsive Photo Grid problem.
 * Don't change this file; build on top of it.
 */

export interface Photo {
  id: string;
  title: string;
  /** Use as the tile's background color instead of a real image. */
  color: string;
  takenAt: string; // ISO string
}

export interface PhotoPage {
  photos: Photo[];
  nextCursor: string | null;
}

const TOTAL = 250;
const PAGE_SIZE = 60;
const FAILURE_RATE = 0.15;

const TITLES = [
  "Beach", "Sunset", "Dog", "Birthday", "Hike", "Coffee", "City",
  "Snow", "Garden", "Concert", "Train", "Bridge", "Market", "Lake",
];

const db: Photo[] = Array.from({ length: TOTAL }, (_, i) => ({
  id: `p${i + 1}`,
  title: `${TITLES[(i * 5) % TITLES.length]} ${i + 1}`,
  color: `hsl(${(i * 37) % 360} 55% 62%)`,
  takenAt: new Date(Date.UTC(2026, 8, 30) - i * 9 * 60 * 60 * 1000).toISOString(),
}));

const delay = (min = 300, max = 900) =>
  new Promise((resolve) => setTimeout(resolve, min + Math.random() * (max - min)));

/** Cursor is the id of the last photo of the previous page (null = first page). */
export async function fetchPhotos(cursor: string | null): Promise<PhotoPage> {
  await delay();
  if (Math.random() < FAILURE_RATE) {
    throw new Error("Failed to load photos.");
  }
  const start = cursor === null ? 0 : db.findIndex((p) => p.id === cursor) + 1;
  const photos = db.slice(start, start + PAGE_SIZE).map((p) => ({ ...p }));
  const hasMore = start + PAGE_SIZE < db.length;
  return { photos, nextCursor: hasMore ? photos[photos.length - 1].id : null };
}

/** Rejects ~15% of the time. */
export async function deletePhotos(ids: string[]): Promise<void> {
  await delay();
  if (Math.random() < FAILURE_RATE) {
    throw new Error(`Couldn't delete ${ids.length} photo(s).`);
  }
  ids.forEach((id) => {
    const index = db.findIndex((p) => p.id === id);
    if (index !== -1) db.splice(index, 1);
  });
}
