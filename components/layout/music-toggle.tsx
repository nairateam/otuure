"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Background music, on by default.
 *
 * Browsers only allow sound after the visitor interacts with the page, so on load it tries to play,
 * and if the browser says no, it starts on the first click, tap or key press anywhere.
 * Turning it off is remembered (localStorage), so it stays off on later visits until turned back on.
 *
 * Playing fades in to a low volume; pausing fades out. It pauses while the tab is hidden and picks up
 * again when the visitor returns. Four bars dance while it plays and lie still when paused or with
 * reduced motion.
 */

const VOLUME = 0.35;
const FADE_MS = 1200;
const STORE_KEY = "otuure-music";
const FIRST_INTERACTION = ["pointerdown", "keydown", "touchstart"] as const;

export function MusicToggle({ src, track, className = "" }: { src: string; track?: string; className?: string }) {
  const button = useRef<HTMLButtonElement>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const fade = useRef(0);
  const [playing, setPlaying] = useState(false);

  function getAudio() {
    if (!audio.current) {
      audio.current = new Audio(src);
      audio.current.loop = true;
      audio.current.volume = 0;
    }
    return audio.current;
  }

  // Ramp the volume to a target, then optionally pause
  function rampTo(target: number, then?: () => void) {
    const el = audio.current;
    if (!el) return;
    cancelAnimationFrame(fade.current);
    const from = el.volume;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / FADE_MS, 1);
      el.volume = from + (target - from) * t;
      if (t < 1) fade.current = requestAnimationFrame(step);
      else then?.();
    };
    fade.current = requestAnimationFrame(step);
  }

  // Resolves true when sound actually started (false when the browser blocked it)
  async function play() {
    const el = getAudio();
    try {
      await el.play();
      setPlaying(true);
      rampTo(VOLUME);
      return true;
    } catch {
      setPlaying(false);
      return false;
    }
  }

  function remember(on: boolean) {
    try {
      if (on) localStorage.removeItem(STORE_KEY);
      else localStorage.setItem(STORE_KEY, "off");
    } catch {
      // Storage blocked (private mode): the choice just isn't remembered
    }
  }

  async function toggle() {
    if (playing) {
      setPlaying(false);
      remember(false);
      const el = audio.current;
      rampTo(0, () => el?.pause());
    } else {
      remember(true);
      await play();
    }
  }

  // Autoplay on load, or on the first interaction if the browser blocks it.
  // A click on the toggle itself is left to the toggle, so it doesn't start and stop in one go.
  useEffect(() => {
    let off = false;
    try {
      off = localStorage.getItem(STORE_KEY) === "off";
    } catch {}
    if (off) return;

    const el = getAudio();
    const started = () => {
      setPlaying(true);
      rampTo(VOLUME);
    };
    const unlock = (e: Event) => {
      stopWaiting();
      if (!button.current?.contains(e.target as Node)) el.play().then(started, () => {});
    };
    const stopWaiting = () => FIRST_INTERACTION.forEach((t) => window.removeEventListener(t, unlock, true));

    el.play().then(started, () =>
      FIRST_INTERACTION.forEach((t) => window.addEventListener(t, unlock, { capture: true })),
    );
    return stopWaiting;
    // Runs once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pause with the tab hidden; resume where it left off when the visitor returns
  useEffect(() => {
    const onVisibility = () => {
      const el = audio.current;
      if (!el || !playing) return;
      if (document.hidden) el.pause();
      else el.play().catch(() => setPlaying(false));
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [playing]);

  useEffect(
    () => () => {
      cancelAnimationFrame(fade.current);
      audio.current?.pause();
    },
    [],
  );

  return (
    <button
      ref={button}
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? "Pause background music" : "Play background music"}
      title={playing ? `Sound off${track ? ` · ${track}` : ""}` : `Sound on${track ? ` · ${track}` : ""}`}
      className={`glass grid size-[46px] place-items-center rounded-full text-white transition-transform duration-120 active:scale-[0.96] ${className}`}
    >
      <span className="flex h-4 items-end gap-[3px]" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`w-[2px] origin-bottom rounded-full bg-current ${playing ? "motion-safe:animate-[eq_900ms_ease-in-out_infinite_alternate]" : ""}`}
            style={{
              height: playing ? `${[60, 100, 45, 80][i]}%` : "25%",
              animationDelay: `${i * -0.22}s`,
              transition: "height 240ms",
            }}
          />
        ))}
      </span>
    </button>
  );
}
