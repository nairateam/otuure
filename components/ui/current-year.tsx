import { cacheLife } from "next/cache";

// Cached so Cache Components can prerender it; the cache refreshes daily, so the year rolls over on its own
export async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}
