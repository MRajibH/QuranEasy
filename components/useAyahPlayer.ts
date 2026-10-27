"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ayahAudioUrl } from "@/lib/reciters";
import { stopAudio } from "@/lib/audio";
import { useSettings } from "@/lib/settings";

export interface PlayerState {
  ayah: number;
  playing: boolean;
  /** keep going to the next ayah when this one is done */
  continuous: boolean;
  /** how many times the current ayah has been heard so far */
  heard: number;
}

/**
 * Full-ayah recitation for one surah: play one ayah or the whole surah, repeat each ayah N times
 * (for memorisation), and preload the next ayah so playback flows without gaps.
 */
export function useAyahPlayer(surah: number, verseCount: number) {
  const { reciter, repeat } = useSettings();
  const audio = useRef<HTMLAudioElement | null>(null);
  const next = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<PlayerState | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const load = useCallback(
    (ayah: number) => {
      const a = audio.current ?? new Audio();
      audio.current = a;
      a.src = ayahAudioUrl(reciter, surah, ayah);
      a.play().catch(() => setState((s) => (s ? { ...s, playing: false } : s)));
      if (ayah < verseCount) {
        next.current = new Audio(ayahAudioUrl(reciter, surah, ayah + 1));
        next.current.preload = "auto";
      }
    },
    [reciter, surah, verseCount],
  );

  const play = useCallback(
    (ayah: number, continuous: boolean) => {
      stopAudio(); // stop any word-by-word playback
      setState({ ayah, playing: true, continuous, heard: 1 });
      load(ayah);
    },
    [load],
  );

  const pause = useCallback(() => {
    audio.current?.pause();
    setState((s) => (s ? { ...s, playing: false } : s));
  }, []);

  const resume = useCallback(() => {
    stopAudio();
    audio.current?.play().catch(() => {});
    setState((s) => (s ? { ...s, playing: true } : s));
  }, []);

  const close = useCallback(() => {
    audio.current?.pause();
    setState(null);
  }, []);

  const go = useCallback(
    (delta: number) => {
      const s = stateRef.current;
      if (!s) return;
      const ayah = Math.min(verseCount, Math.max(1, s.ayah + delta));
      play(ayah, s.continuous);
    },
    [play, verseCount],
  );

  // When an ayah ends: repeat it, move on, or stop.
  useEffect(() => {
    const a = audio.current ?? new Audio();
    audio.current = a;
    const onEnded = () => {
      const s = stateRef.current;
      if (!s) return;
      if (s.heard < repeat) {
        setState({ ...s, heard: s.heard + 1 });
        a.currentTime = 0;
        a.play().catch(() => {});
      } else if (s.continuous && s.ayah < verseCount) {
        setState({ ...s, ayah: s.ayah + 1, heard: 1 });
        load(s.ayah + 1);
      } else {
        setState({ ...s, playing: false });
      }
    };
    a.addEventListener("ended", onEnded);
    return () => a.removeEventListener("ended", onEnded);
  }, [repeat, verseCount, load]);

  // Switching reciter mid-ayah restarts that ayah with the new voice.
  const reciterRef = useRef(reciter);
  useEffect(() => {
    if (reciterRef.current === reciter) return;
    reciterRef.current = reciter;
    const s = stateRef.current;
    if (s?.playing) load(s.ayah);
  }, [reciter, load]);

  useEffect(() => () => audio.current?.pause(), []);

  return { state, play, pause, resume, close, go };
}
