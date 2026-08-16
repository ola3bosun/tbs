"use client";

import { useState, useEffect, useRef } from "react";

// Maximum number of logs kept in memory to prevent memory buildup
const MAX_LOG_HISTORY = 20;

export default function SystemMatrix({
  track = { isPlaying: false },
  activeHover,
}) {
  const [time, setTime] = useState("");
  const [logs, setLogs] = useState([]);
  const logContainerRef = useRef(null);

  // Helper function to append a log and keep the list bounded
  const appendLog = (message) => {
    const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false });
    const formatted = `[${timestamp}] ${message}`;
    setLogs((prev) => [...prev, formatted].slice(-MAX_LOG_HISTORY));
  };

  // 1. Live 24-hour clock for Ibadan (Lagos timezone)
  useEffect(() => {
    const updateTime = () => {
      const options = {
        timeZone: "Africa/Lagos",
        hour: "2-digit",
        hour12: false,
        minute: "2-digit",
        second: "2-digit",
      };
      setTime(new Intl.DateTimeFormat("en-US", options).format(new Date()));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. System boot sequence logs on component mount
  useEffect(() => {
    const startupSequence = [
      "Contacting dev_TBS...",
      "Establishing Spotify stream connection...",
    ];

    const timerIds = startupSequence.map((msg, index) => {
      return setTimeout(() => {
        appendLog(msg);
      }, (index + 1) * 400);
    });

    return () => {
      timerIds.forEach((id) => clearTimeout(id));
    };
  }, []);

  // 3. Log Spotify track state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (track.isPlaying) {
        appendLog(`Spotify API link: active // listening to "${track.title}"`);
      } else {
        appendLog("Spotify signal lost // parsing static noise.");
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [track.isPlaying, track.title]);

  // 4. Log hover events from interactive navigation and links
  useEffect(() => {
    if (!activeHover) return;
    const timer = setTimeout(() => {
      appendLog(`Event trigger // ${activeHover}`);
    }, 0);

    return () => clearTimeout(timer);
  }, [activeHover]);

  // 5. Keep the log display pinned to the latest message
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col space-y-4 md:space-y-6 font-mono text-[10px] text-neutral-500 tracking-wider uppercase md:h-[220px] justify-between pt-2">
      {/* Location and time metadata */}
      <div className="space-y-4">
        <div className="space-y-1">
          <span className="text-neutral-600">{"// Location"}</span>
          <p className="text-neutral-400">Ibadan, NG / 7.3775° N, 3.9470° E</p>
          <p className="text-neutral-400">
            Local Time:{" "}
            <span className="text-[#f4efe9] tabular-nums">
              {time || "00:00:00"}
            </span>
          </p>
        </div>
      </div>

      {/* Live streaming activity log window */}
      <div className="hidden md:flex space-y-2 flex-1 flex-col min-h-0 justify-end">
        <span className="text-neutral-600 block border-b border-neutral-900 pb-1">
          {"// Activity Log"}
        </span>
        <div
          ref={logContainerRef}
          className="space-y-1 overflow-y-auto max-h-[120px] scrollbar-none text-neutral-400 select-none pr-2"
          style={{
            maskImage: "linear-gradient(to bottom, transparent 0%, white 20%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, white 20%)",
          }}
        >
          {logs.map((log, idx) => (
            <p
              key={idx}
              className="truncate tracking-wide text-[9px] font-light text-neutral-500 first-of-type:text-[#f4efe9]"
            >
              {log}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
