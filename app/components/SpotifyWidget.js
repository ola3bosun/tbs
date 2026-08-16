"use client";

import { useEffect, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*!?/[]{}~^";

function useTextScramble(target) {
  const [output, setOutput] = useState(target ?? "");
  const [isScrambling, setScrambling] = useState(false);

  useEffect(() => {
    if (!target) {
      const frame = requestAnimationFrame(() => {
        setOutput("");
        setScrambling(false);
      });
      return () => cancelAnimationFrame(frame);
    }

    let frameId = null;
    let currentFrame = 0;
    const TOTAL_FRAMES = 22;

    const startTimer = setTimeout(() => {
      setScrambling(true);

      const tick = () => {
        currentFrame++;
        const progress = currentFrame / TOTAL_FRAMES;
        const lockedCount = Math.floor(progress * target.length);

        const scrambled = target
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i < lockedCount) return char;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("");

        setOutput(scrambled);

        if (currentFrame < TOTAL_FRAMES) {
          frameId = requestAnimationFrame(tick);
        } else {
          setOutput(target);
          setScrambling(false);
        }
      };

      frameId = requestAnimationFrame(tick);
    }, 0);

    return () => {
      clearTimeout(startTimer);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [target]);

  return { output, isScrambling };
}

export default function SpotifyWidget({ track = { isPlaying: false } }) {
  const { output: titleText, isScrambling } = useTextScramble(
    track.isPlaying ? track.title : null
  );

  const { output: artistText } = useTextScramble(
    track.isPlaying ? track.artist : null
  );

  const { output: albumText } = useTextScramble(
    track.isPlaying ? track.album : null
  );

  return (
    <div className="text-center mix-blend-difference pointer-events-auto">
      {track.isPlaying ? (
        <a
          href={track.songUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="group block focus:outline-none focus:ring-1 focus:ring-[#ecdfcc]"
          aria-label={`Currently listening to ${track.title} by ${track.artist}`}
        >
          {/* Animated 4-Bar Equalizer Frequency Waveform */}
          <div
            className="flex items-center justify-center gap-1.5 mb-1"
            aria-hidden="true"
          >
            <span className="inline-flex items-end gap-[2px] h-3">
              <span className="w-[2px] min-w-[2px] bg-[#ecdfcc] rounded-full animate-eq-1" />
              <span className="w-[2px] min-w-[2px] bg-[#ecdfcc] rounded-full animate-eq-2" />
              <span className="w-[2px] min-w-[2px] bg-[#ecdfcc] rounded-full animate-eq-3" />
              <span className="w-[2px] min-w-[2px] bg-[#ecdfcc] rounded-full animate-eq-4" />
            </span>
          </div>

          {/* Track Metadata with Scramble on Track Switch */}
          <p className="text-[10px] sm:text-xs font-medium text-white group-hover:text-neutral-300 transition-colors whitespace-nowrap">
            {isScrambling ? (
              <span className="font-mono">
                [ {titleText}{" "}
                <span className="hidden sm:inline text-neutral-500">
                  — {artistText}{" "}
                </span>
                <span className="hidden sm:inline">
                  {" // "} {albumText}
                </span>
                {" ]"}
              </span>
            ) : (
              <>
                [ {track.title}{" "}
                <span className="hidden sm:inline text-neutral-500">
                  — {track.artist}{" "}
                </span>
                <span className="hidden sm:inline">
                  {" // "} {track.album}
                </span>
                {" ]"}
              </>
            )}
          </p>
        </a>
      ) : (
        /* Clean Production Offline State */
        <div className="opacity-50 select-none">
          <span className="text-[8px] uppercase tracking-widest text-neutral-500 font-mono block mb-0.5">
            Playback
          </span>
          <p className="text-[10px] sm:text-xs font-medium text-neutral-400">
            Currently Offline
          </p>
        </div>
      )}
    </div>
  );
}