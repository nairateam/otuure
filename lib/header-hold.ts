// Lets a section keep the site header tucked away (e.g. while "What I do" is pinned),
// overriding the usual "show on scroll up" behaviour. Each holder passes its own reason.

const holds = new Set<string>();
const listeners = new Set<() => void>();

export function holdHeader(reason: string, on: boolean) {
  const had = holds.has(reason);
  if (on === had) return;
  if (on) holds.add(reason);
  else holds.delete(reason);
  listeners.forEach((l) => l());
}

export function headerHeld() {
  return holds.size > 0;
}

export function onHeaderHold(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
