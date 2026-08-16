"use client";

export default function RollingText({
  text = "",
  className = "",
  staggerMs = 25,
}) {
  const characters = text.split("");

  return (
    <span
      className={`relative inline-flex items-center overflow-hidden leading-none select-none pointer-events-none ${className}`}
      aria-label={text}
    >
      {characters.map((char, index) => {
        if (char === " ") {
          return (
            <span key={index} className="inline-block">
              &nbsp;
            </span>
          );
        }

        const delay = `${index * staggerMs}ms`;

        return (
          <span
            key={index}
            className="relative inline-block overflow-hidden h-[1.2em] leading-[1.2em] pointer-events-none"
          >
            {/* Top primary character that slides up on group hover */}
            <span
              className="inline-block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full will-change-transform pointer-events-none"
              style={{ transitionDelay: delay }}
              aria-hidden="true"
            >
              {char}
            </span>

            {/* Bottom duplicate character that rolls in from below on group hover */}
            <span
              className="absolute top-0 left-0 inline-block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] translate-y-full group-hover:translate-y-0 text-[#f4efe9] will-change-transform pointer-events-none"
              style={{ transitionDelay: delay }}
              aria-hidden="true"
            >
              {char}
            </span>
          </span>
        );
      })}
    </span>
  );
}
