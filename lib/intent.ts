"use client";

import { useSyncExternalStore } from "react";
import type { WorkFilter } from "@/lib/work";

// What the visitor came for, set by links that jump to another section
// (e.g. "Hair coaching" pre-selects the enquiry type on the contact form).
// Sections that care read it with `useIntent()`.
export type Intent = {
  enquiry?: "hair-coaching" | "media-kit";
  workFilter?: WorkFilter;
};

const empty: Intent = {};
let current: Intent = empty;
const listeners = new Set<() => void>();

export function setIntent(next: Intent) {
  current = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useIntent() {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => empty
  );
}
