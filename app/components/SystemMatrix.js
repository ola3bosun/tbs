// components/SystemMatrix.js
'use client';

import { useState, useEffect, useRef } from 'react';

export default function SystemMatrix({ track, activeHover }) {
  const [time, setTime] = useState('');
  const [logs, setLogs] = useState([]);
  const logContainerRef = useRef(null);

  // 1. Live 24-hour clock for Ibadan time
  useEffect(() => {
    const updateTime = () => {
      const options = {
        timeZone: 'Africa/Lagos',
        hour: '2-digit',
        hour12: false,
        minute: '2-digit',
        second: '2-digit',
      };
      setTime(new Intl.DateTimeFormat('en-US', options).format(new Date()));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Initialize the system startup logs once on mount
  useEffect(() => {
    const startupSequence = [
      'Contacting dev_TBS...',
      'Vercel core environment: handshaked.',
      'Turbopack local compiler: active // 60fps nominal.',
      'Establishing Spotify stream connection...',
    ];

    startupSequence.forEach((msg, index) => {
      setTimeout(() => {
        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
        setLogs((prev) => [...prev, `[${timestamp}] ${msg}`]);
      }, index * 400); // Stagger the lines beautifully on load
    });
  }, []);

  // 3. Listen for Spotify track state changes to push stream telemetry
  useEffect(() => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    if (track.isPlaying) {
      setLogs((prev) => [...prev, `[${timestamp}] Spotify API link: active // listening to "${track.title}"`]);
    } else if (logs.length > 4) {
      setLogs((prev) => [...prev, `[${timestamp}] Spotify signal lost // parsing static noise.`]);
    }
  }, [track.isPlaying, track.title]);

  // 4. Capture interactive hover events sent down from the main page layout
  useEffect(() => {
    if (!activeHover) return;
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs((prev) => [...prev, `[${timestamp}] Event trigger // ${activeHover}`]);
  }, [activeHover]);

  // 5. Automatically keep the log view pinned to the bottom as new streams come in
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="hidden lg:flex flex-col space-y-6 font-mono text-[10px] text-neutral-500 tracking-wider uppercase h-[220px] justify-between pt-2">
      
      {/* Structural Static Meta Information */}
      <div className="space-y-4">
        <div className="space-y-1">
          <span className="text-neutral-600">// Location</span>
          <p className="text-neutral-400">Ibadan, NG / 7.3775° N, 3.9470° E</p>
          <p className="text-neutral-400">Local Time: <span className="text-[#f4efe9] tabular-nums">{time || '00:00:00'}</span></p>
        </div>
      </div>

      {/* Dynamic Streaming Console Log */}
      <div className="space-y-2 flex-1 flex flex-col min-h-0 justify-end">
        <span className="text-neutral-600 block border-b border-neutral-900 pb-1">// Activity Log</span>
        <div 
          ref={logContainerRef}
          className="space-y-1 overflow-y-auto max-h-[120px] scrollbar-none text-neutral-400 select-none pr-2"
          style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, white 20%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, white 20%)' }}
        >
          {logs.map((log, idx) => (
            <p key={idx} className="truncate tracking-wide text-[9px] font-light text-neutral-500 first-of-type:text-[#f4efe9]">
              {log}
            </p>
          ))}
        </div>
      </div>

    </div>
  );
}