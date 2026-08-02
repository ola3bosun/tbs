"use client";

import { useEffect, useState } from "react";

export default function SpotifyWidget({ track = { isPlaying: false } }) {
  return (
    <div className="hidden md:block absolute left-1/2 -translate-x-1/2 text-center mix-blend-difference pointer-events-auto">
      {track.isPlaying ? (
        <a 
          href={track.songUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="group block"
        >
          <span className="text-[8px] uppercase tracking-widest text-neutral-400 font-mono flex items-center justify-center gap-2 mb-1">
            Live <span className="w-1 h-1 bg-white animate-ping" />
          </span>
          <p className="text-xs font-medium text-white group-hover:text-neutral-300 transition-colors">
            {track.title} <span className="text-neutral-500">— {track.artist}</span>
          </p>
        </a>
      ) : (
        <div className="opacity-50">
          <span className="text-[8px] uppercase tracking-widest text-neutral-500 font-mono flex items-center justify-center gap-2 mb-1">
            Playback
          </span>
          <p className="text-xs font-medium text-neutral-400">Currently Offline</p>
        </div>
      )}
    </div>
  );
}