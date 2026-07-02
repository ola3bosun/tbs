// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getNowPlaying } from './actions/spotify';

interface TrackInfo {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  albumImageUrl?: string;
  songUrl?: string;
}

export default function LandingPage() {
  const [track, setTrack] = useState<TrackInfo>({ isPlaying: false });

  useEffect(() => {
    async function updateTrack() {
      try {
        const data = await getNowPlaying();
        setTrack(data);
      } catch (error) {
        console.error('Failed to fetch track info:', error);
      }
    }

    updateTrack();
    const interval = setInterval(updateTrack, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 font-sans tracking-tight bg-[#0b0b0b] text-[#f5f5f5]">
      <div className="w-full max-w-xs space-y-8">
        {/* Profile Header */}
        <header className="space-y-1">
          <h1 className="text-xl font-medium tracking-tighter">'Tubosun</h1>
          <p className="text-xs text-neutral-500">Developer...kinda</p>
        </header>

        {/* Live Status Container */}
        <section className="pt-4 border-t border-neutral-900 transition-all duration-500">
          {track.isPlaying ? (
            <a 
              href={track.songUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-4 group cursor-pointer"
            >
              {track.albumImageUrl && (
                <img 
                  src={track.albumImageUrl} 
                  alt={track.title} 
                  className="w-12 h-12 rounded object-cover grayscale group-hover:grayscale-0 transition-all duration-300 border border-neutral-800"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-medium">Now Playing</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <h2 className="text-sm font-medium truncate text-neutral-200 group-hover:text-emerald-400 transition-colors">
                  {track.title}
                </h2>
                <p className="text-xs text-neutral-500 truncate">{track.artist}</p>
              </div>
            </a>
          ) : (
            <div className="flex items-center gap-3 py-2 text-neutral-600">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
              <p className="text-xs tracking-wide">Currently offline</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}