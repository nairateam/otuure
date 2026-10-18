// Shared "page revealed" signal: the preloader fires it as its curtain starts to lift
// (or straight away when the intro is skipped), and the hero and header wait on it.

export const INTRO_KEY = "otuure-intro";

let revealed = false;
const waiters = new Set<() => void>();

export function revealPage() {
  if (revealed) return;
  revealed = true;
  waiters.forEach((cb) => cb());
  waiters.clear();
}

/** Runs `cb` once the page is revealed (immediately if it already is). Returns an unsubscribe. */
export function onReveal(cb: () => void) {
  if (revealed) {
    cb();
    return () => {};
  }
  waiters.add(cb);
  return () => {
    waiters.delete(cb);
  };
}

/** True when the intro already played this session (set by the inline script in the layout) */
export function introSeen() {
  return document.documentElement.dataset.intro === "seen";
}
