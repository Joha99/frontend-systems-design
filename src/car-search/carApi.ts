/**
 * Fake backend for the car search problem. Don't edit this file: treat it as
 * the server. Read the exported API only. Works offline.
 *
 *   searchCars({ make?, maxPrice?, cursor?, limit? })
 *     → { cars, nextCursor }     (like GET /api/cars?make=…&maxPrice=…&cursor=…)
 *   getMakes() → string[]        (like GET /api/makes)
 *
 * What it does on purpose (your UI has to cope with all of it):
 * - Latency is 300–1500 ms, random per request, so responses can arrive
 *   out of order.
 * - About 1 in 6 requests fails (rejects with an Error). Retrying works.
 * - `nextCursor` is null on the last page.
 * - Some filter combinations return no cars.
 */

export type Car = {
  id: string;
  make: string;
  model: string;
  year: number;
  pricePerDay: number; // whole dollars
  rating: number | null; // 1–5 with one decimal, null = no trips yet
  trips: number;
  city: string;
};

export type SearchParams = {
  make?: string;
  maxPrice?: number;
  cursor?: string | null;
  limit?: number; // default 12
};

export type SearchResponse = {
  cars: Car[];
  nextCursor: string | null;
};

const MAKES = ["Toyota", "Honda", "Tesla", "Ford", "BMW", "Jeep", "Subaru"];
const MODELS: Record<string, string[]> = {
  Toyota: ["Corolla", "RAV4", "Camry"],
  Honda: ["Civic", "CR-V", "Accord"],
  Tesla: ["Model 3", "Model Y"],
  Ford: ["Mustang", "Bronco", "Escape"],
  BMW: ["3 Series", "X3"],
  Jeep: ["Wrangler", "Grand Cherokee"],
  Subaru: ["Outback", "Forester"],
};
const CITIES = ["Boston", "Denver", "Austin", "Seattle", "Miami"];

// Deterministic data so every run is the same.
let seed = 42;
const rand = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

const CARS: Car[] = Array.from({ length: 57 }, (_, i) => {
  const make = MAKES[Math.floor(rand() * MAKES.length)];
  const models = MODELS[make];
  const trips = rand() < 0.15 ? 0 : Math.floor(rand() * 300);
  return {
    id: "car_" + (i + 1),
    make,
    model: models[Math.floor(rand() * models.length)],
    year: 2016 + Math.floor(rand() * 10),
    pricePerDay: 35 + Math.floor(rand() * 180),
    rating: trips === 0 ? null : Math.round((3.5 + rand() * 1.5) * 10) / 10,
    trips,
    city: CITIES[Math.floor(rand() * CITIES.length)],
  };
});

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const latency = () => 300 + Math.random() * 1200;

export async function getMakes(): Promise<string[]> {
  await wait(latency());
  return [...MAKES].sort();
}

export async function searchCars(
  params: SearchParams = {},
): Promise<SearchResponse> {
  const { make, maxPrice, cursor = null, limit = 12 } = params;
  await wait(latency());
  if (Math.random() < 1 / 6)
    throw new Error("503: service unavailable, try again");

  const matching = CARS.filter(
    (c) =>
      (!make || c.make === make) &&
      (maxPrice == null || c.pricePerDay <= maxPrice),
  );
  const start = cursor ? Number(atob(cursor)) : 0;
  const page = matching.slice(start, start + limit);
  const end = start + page.length;
  return {
    cars: page.map((c) => ({ ...c })),
    nextCursor: end < matching.length ? btoa(String(end)) : null,
  };
}
