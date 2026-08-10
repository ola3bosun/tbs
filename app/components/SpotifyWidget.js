"use client";

import { useEffect, useRef, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*!?/[]{}~^";

function useTextScramble(target, deps) {
  const [output, setOutput]           = useState(target ?? "");
  const [isScrambling, setScrambling] = useState(false);
  const rafRef   = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => {
    if (!target) {
      setOutput("");
      setScrambling(false);
      return;
    }

    frameRef.current = 0;
    cancelAnimationFrame(rafRef.current);
    setScrambling(true);

    const TOTAL_FRAMES = 22;

    const tick = () => {
      frameRef.current++;
      const progress    = frameRef.current / TOTAL_FRAMES;
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

      if (frameRef.current < TOTAL_FRAMES) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setOutput(target);
        setScrambling(false);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, deps);

  return { output, isScrambling };
}

export default function SpotifyWidget({ track = { isPlaying: false } }) {

  const { output: titleText, isScrambling } = useTextScramble(
    track.isPlaying ? track.title : null,
    [track.title, track.isPlaying]
  );
  
  const { output: artistText } = useTextScramble(
    track.isPlaying ? track.artist : null,
    [track.artist, track.isPlaying]
  );
  
  const { output: albumText } = useTextScramble(
    track.isPlaying ? track.album : null,
    [track.album, track.isPlaying]
  );

  return (
    <div className="text-center mix-blend-difference pointer-events-auto">
      {track.isPlaying ? (
        <a
          href={track.songUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group block"
          aria-label={`Currently listening to ${track.title} by ${track.artist}`}
        >
          <span className="text-[8px] uppercase tracking-widest text-neutral-400 font-mono flex items-center justify-center gap-1.5 mb-0.5">
            Live <span className="w-1 h-1 bg-white animate-ping rounded-full" />
          </span>

          <p className="text-[10px] sm:text-xs font-medium text-white group-hover:text-neutral-300 transition-colors whitespace-nowrap">
            {isScrambling ? (
              <span className="font-mono">
                [ {titleText}{" "}
                <span className="hidden sm:inline text-neutral-500">— {artistText} </span>
                <span className="hidden sm:inline">{" // "} {albumText}</span>
                {" "}]
              </span>
            ) : (
              <>
                [ {track.title}{" "}
                <span className="hidden sm:inline text-neutral-500">— {track.artist} </span>
                <span className="hidden sm:inline">{" // "} {track.album}</span>
                {" "}]
              </>
            )}
          </p>
        </a>
      ) : (
        <div className="opacity-50">
          <span className="text-[8px] uppercase tracking-widest text-neutral-500 font-mono flex items-center justify-center gap-1.5 mb-0.5">
            Playback
          </span>
          <p className="text-[10px] sm:text-xs font-medium text-neutral-400">Currently Offline</p>
        </div>
      )}
    </div>
  );
}