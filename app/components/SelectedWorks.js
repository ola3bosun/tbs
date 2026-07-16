"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const projects = [
  {
    id: "TRN_01",
    name: "Transcend Projects",
    sector: "Engineering / Construction",
    role: "Web Architecture",
    year: "2026",
    status: "DEPLOYED",
    accent: "#d9ff57",
    type: "architecture",
    descriptor: "Built environments translated into digital systems.",
  },
  {
    id: "APK_02",
    name: "Aproko Doctor",
    sector: "Health Education",
    role: "Premium UI/UX",
    year: "2026",
    status: "BETA_LINK",
    accent: "#ff6b4a",
    type: "health",
    descriptor: "Clear, credible health education at human scale.",
  },
  {
    id: "TNS_03",
    name: "The Nuanced Studio",
    sector: "Creative Agency",
    role: "Engineering Strategy",
    year: "2025—26",
    status: "ACTIVE",
    accent: "#ddd5ff",
    type: "studio",
    descriptor: "A tactile digital identity for nuanced creative work.",
  },
  {
    id: "OD_04",
    name: "Olaoluwa Diyaolu",
    sector: "Personal Branding",
    role: "Frontend Engineering",
    year: "2026",
    status: "IN_PROGRESS",
    accent: "#70a7ff",
    type: "identity",
    descriptor: "A personal archive designed as a living instrument.",
  },
];

function ArchitecturalVisual() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 grid grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="border-r border-white/8 last:border-r-0"
          />
        ))}
      </div>

      <div className="absolute inset-0 grid grid-rows-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="border-b border-white/8 last:border-b-0"
          />
        ))}
      </div>

      <div className="absolute left-[9%] top-[14%] h-[70%] w-[24%] border border-white/30 bg-white/[0.035]" />
      <div className="absolute left-[38%] top-[28%] h-[56%] w-[20%] bg-[var(--accent)] opacity-80" />
      <div className="absolute right-[8%] top-[8%] h-[76%] w-[27%] border border-white/20 bg-black/20" />

      <div className="absolute bottom-[7%] left-[6%] font-mono text-[8px] uppercase tracking-[0.32em] text-white/40">
        Spatial system / 01—24
      </div>

      <div className="absolute right-[9%] top-[13%] text-[clamp(4rem,10vw,9rem)] font-light leading-none tracking-[-0.08em] text-white/10">
        TP
      </div>
    </div>
  );
}

function HealthVisual() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-1/2 aspect-square w-[48%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />
      <div className="selected-orbit absolute left-1/2 top-1/2 aspect-square w-[67%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/15" />
      <div className="absolute left-1/2 top-1/2 aspect-square w-[25%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] opacity-90 blur-[1px]" />
      <div className="selected-pulse-core absolute left-1/2 top-1/2 aspect-square w-[25%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--accent)]" />

      <svg
        className="absolute inset-x-[7%] top-1/2 h-[36%] w-[86%] -translate-y-1/2"
        viewBox="0 0 800 220"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 118 H125 L160 118 L184 45 L216 180 L250 89 L281 118 H800"
          fill="none"
          stroke="rgba(255,255,255,.12)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        <path
          className="selected-pulse-line"
          d="M0 118 H125 L160 118 L184 45 L216 180 L250 89 L281 118 H800"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="absolute left-[7%] top-[8%] font-mono text-[8px] uppercase tracking-[0.3em] text-white/40">
        Signal integrity 98.7%
      </div>

      <div className="absolute bottom-[8%] right-[7%] font-mono text-[8px] uppercase tracking-[0.3em] text-white/40">
        Human data / live
      </div>
    </div>
  );
}

function StudioVisual() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -left-[7%] top-[8%] text-[clamp(5rem,13vw,12rem)] font-medium leading-none tracking-[-0.09em] text-white/[0.06]">
        NUANCE
      </div>

      <div className="absolute left-[8%] top-[22%] max-w-[72%]">
        <div className="overflow-hidden">
          <span className="block text-[clamp(2.4rem,7vw,7rem)] font-light leading-[0.82] tracking-[-0.07em] text-white">
            subtle
          </span>
        </div>
        <div className="overflow-hidden">
          <span
            className="block translate-x-[12%] text-[clamp(2.4rem,7vw,7rem)] font-light italic leading-[0.82] tracking-[-0.07em]"
            style={{ color: "var(--accent)" }}
          >
            but felt.
          </span>
        </div>
      </div>

      <div className="absolute bottom-[8%] left-[8%] h-px w-[84%] bg-white/15">
        <div className="h-full w-[37%] bg-[var(--accent)]" />
      </div>

      <div className="absolute bottom-[11%] left-[8%] font-mono text-[8px] uppercase tracking-[0.3em] text-white/40">
        Creative direction / digital craft
      </div>

      <div className="absolute right-[8%] top-[10%] flex h-16 w-16 items-center justify-center rounded-full border border-white/20">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
      </div>
    </div>
  );
}

function IdentityVisual() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-1/2 text-[clamp(8rem,22vw,20rem)] font-medium leading-none tracking-[-0.12em] text-white/[0.055] [transform:translate(-54%,-52%)]">
        O
      </div>

      {[34, 51, 70].map((size, index) => (
        <div
          key={size}
          className={`absolute left-1/2 top-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border ${
            index === 1 ? "border-dashed border-white/25" : "border-white/12"
          } ${index === 1 ? "selected-orbit-reverse" : "selected-orbit"}`}
          style={{
            width: `${size}%`,
            animationDelay: `${index * -2.4}s`,
          }}
        />
      ))}

      <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] shadow-[0_0_30px_var(--accent)]" />

      <div className="absolute left-[7%] top-[8%] font-mono text-[8px] uppercase tracking-[0.3em] text-white/40">
        Personal signal / TBS
      </div>

      <div className="absolute bottom-[8%] right-[7%] text-right font-mono text-[8px] uppercase leading-relaxed tracking-[0.3em] text-white/40">
        Ibadan, Nigeria
        <br />
        7.3775° N / 3.9470° E
      </div>
    </div>
  );
}

function ProjectVisual({ type }) {
  if (type === "architecture") return <ArchitecturalVisual />;
  if (type === "health") return <HealthVisual />;
  if (type === "studio") return <StudioVisual />;

  return <IdentityVisual />;
}

export default function SelectedWorks({
  setIsHovered,
  setActiveHover,
}) {
  const sectionRef = useRef(null);
  const panelsRef = useRef([]);
  const progressRef = useRef(null);
  const currentRef = useRef(null);
  const indicatorsRef = useRef([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const panels = panelsRef.current.filter(Boolean);

    if (!section || panels.length === 0) return;

    const media = gsap.matchMedia();

    const context = gsap.context(() => {
      media.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          panels.forEach((panel, index) => {
            const titleWords = panel.querySelectorAll(".project-title-word");
            const metadata = panel.querySelectorAll(".project-meta-row");
            const visual = panel.querySelector(".project-visual");
            const watermark = panel.querySelector(".project-watermark");
            const eyebrow = panel.querySelector(".project-eyebrow");

            gsap.set(panel, {
              zIndex: index + 1,
              visibility: "visible",
            });

            if (index === 0) {
              panel.setAttribute("aria-hidden", "false");
              return;
            }

            panel.setAttribute("aria-hidden", "true");

            gsap.set(panel, {
              clipPath:
                "polygon(104% 0%, 104% 0%, 92% 100%, 92% 100%)",
              xPercent: 5,
              scale: 1.035,
            });

            gsap.set(titleWords, {
              yPercent: 115,
              rotate: 2,
            });

            gsap.set(metadata, {
              x: 32,
              opacity: 0,
            });

            gsap.set(visual, {
              xPercent: 16,
              scale: 1.12,
              rotate: 1.5,
            });

            gsap.set(watermark, {
              xPercent: 35,
              opacity: 0,
            });

            gsap.set(eyebrow, {
              y: 14,
              opacity: 0,
            });
          });

          const updateHud = (progress) => {
            const activeIndex = Math.min(
              panels.length - 1,
              Math.max(
                0,
                Math.round(progress * (panels.length - 1)),
              ),
            );

            if (progressRef.current) {
              progressRef.current.style.transform = `scaleX(${progress})`;
            }

            if (currentRef.current) {
              currentRef.current.textContent = String(
                activeIndex + 1,
              ).padStart(2, "0");
            }

            indicatorsRef.current.forEach((indicator, index) => {
              if (!indicator) return;

              const isActive = index === activeIndex;

              indicator.style.backgroundColor = isActive
                ? projects[index].accent
                : "rgba(255,255,255,.18)";

              indicator.style.transform = isActive
                ? "scaleX(1)"
                : "scaleX(.35)";
            });

            panels.forEach((panel, index) => {
              const inactive = index !== activeIndex;
              panel.setAttribute(
                "aria-hidden",
                inactive ? "true" : "false",
              );
              panel.inert = inactive;
            });
          };

          updateHud(0);

          const timeline = gsap.timeline({
            defaults: {
              overwrite: "auto",
            },
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () =>
                `+=${(panels.length - 1) * window.innerHeight * 1.15}`,
              pin: true,
              scrub: 0.75,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => updateHud(self.progress),
            },
          });

          panels.slice(1).forEach((panel, offset) => {
            const index = offset + 1;
            const previousPanel = panels[index - 1];
            const position = index - 1;

            const previousCopy =
              previousPanel.querySelector(".project-copy");
            const previousVisual =
              previousPanel.querySelector(".project-visual");
            const previousWatermark =
              previousPanel.querySelector(".project-watermark");

            const currentTitleWords =
              panel.querySelectorAll(".project-title-word");
            const currentMetadata =
              panel.querySelectorAll(".project-meta-row");
            const currentVisual =
              panel.querySelector(".project-visual");
            const currentWatermark =
              panel.querySelector(".project-watermark");
            const currentEyebrow =
              panel.querySelector(".project-eyebrow");

            timeline
              .to(
                previousCopy,
                {
                  yPercent: -9,
                  opacity: 0.08,
                  filter: "blur(5px)",
                  duration: 0.72,
                  ease: "power2.in",
                },
                position,
              )
              .to(
                previousVisual,
                {
                  yPercent: -7,
                  scale: 0.88,
                  rotate: -1.25,
                  opacity: 0.2,
                  filter: "blur(4px)",
                  duration: 0.9,
                  ease: "power2.inOut",
                },
                position,
              )
              .to(
                previousWatermark,
                {
                  xPercent: -18,
                  opacity: 0,
                  duration: 0.75,
                  ease: "power2.in",
                },
                position,
              )
              .to(
                panel,
                {
                  clipPath:
                    "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                  xPercent: 0,
                  scale: 1,
                  duration: 1,
                  ease: "power3.inOut",
                },
                position,
              )
              .to(
                currentWatermark,
                {
                  xPercent: 0,
                  opacity: 1,
                  duration: 1,
                  ease: "power3.out",
                },
                position + 0.08,
              )
              .to(
                currentVisual,
                {
                  xPercent: 0,
                  scale: 1,
                  rotate: 0,
                  duration: 0.82,
                  ease: "power3.out",
                },
                position + 0.2,
              )
              .to(
                currentEyebrow,
                {
                  y: 0,
                  opacity: 1,
                  duration: 0.55,
                  ease: "power3.out",
                },
                position + 0.27,
              )
              .to(
                currentTitleWords,
                {
                  yPercent: 0,
                  rotate: 0,
                  duration: 0.68,
                  stagger: 0.055,
                  ease: "power4.out",
                },
                position + 0.3,
              )
              .to(
                currentMetadata,
                {
                  x: 0,
                  opacity: 1,
                  duration: 0.58,
                  stagger: 0.045,
                  ease: "power3.out",
                },
                position + 0.4,
              );
          });

          return () => {
            panels.forEach((panel) => {
              panel.inert = false;
              panel.removeAttribute("aria-hidden");
            });
          };
        },
      );
    }, section);

    const refreshId = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      cancelAnimationFrame(refreshId);
      media.revert();
      context.revert();
    };
  }, []);

  const handlePointerMove = (event) => {
    if (
      !window.matchMedia("(hover: hover) and (pointer: fine)")
        .matches
    ) {
      return;
    }

    const target = event.currentTarget.querySelector(
      ".project-visual-tilt",
    );

    if (!target) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    gsap.to(target, {
      rotateY: x * 5,
      rotateX: y * -5,
      x: x * 7,
      y: y * 7,
      duration: 0.7,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  const resetVisualTilt = (event) => {
    const target = event.currentTarget.querySelector(
      ".project-visual-tilt",
    );

    if (target) {
      gsap.to(target, {
        rotateX: 0,
        rotateY: 0,
        x: 0,
        y: 0,
        duration: 0.9,
        ease: "elastic.out(1, 0.45)",
        overwrite: "auto",
      });
    }

    setIsHovered?.(false);
    setActiveHover?.(null);
  };

  return (
    <section
      ref={sectionRef}
      aria-label="Selected projects"
      className="selected-works-section relative z-20 h-auto w-full overflow-hidden border-t border-white/10 bg-[#080808] text-[#f4efe9] md:h-dvh"
    >
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-black/85 px-5 font-mono text-[8px] uppercase tracking-[0.24em] text-white/45 backdrop-blur-md sm:px-8 md:absolute md:inset-x-0 md:top-0 md:h-20 md:bg-transparent md:px-10 md:backdrop-blur-none lg:px-16">
        <div className="flex items-center gap-4">
          <span className="text-white/80">Selected work</span>
          <span className="hidden text-white/25 sm:inline">
            Archive / 2025—26
          </span>
        </div>

        <div className="hidden items-center gap-5 md:flex">
          <span>
            <span ref={currentRef} className="text-white">
              01
            </span>
            <span className="text-white/25"> / 04</span>
          </span>

          <div className="h-px w-32 overflow-hidden bg-white/15 lg:w-48">
            <div
              ref={progressRef}
              className="h-full origin-left scale-x-0 bg-white"
            />
          </div>

          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-white/60 selected-status-pulse" />
            Scroll to scan
          </span>
        </div>

        <span className="md:hidden">04 projects</span>
      </header>

      <div className="selected-works-stage relative h-auto w-full md:h-full">
        {projects.map((project, index) => (
          <article
            key={project.id}
            ref={(element) => {
              panelsRef.current[index] = element;
            }}
            style={{ "--accent": project.accent }}
            className="selected-work-panel relative flex min-h-[100svh] w-full items-center overflow-hidden border-b border-white/10 bg-[#080808] px-5 py-20 sm:px-8 md:absolute md:inset-0 md:h-full md:min-h-0 md:border-b-0 md:px-10 md:py-24 lg:px-16"
            onPointerEnter={() => {
              setIsHovered?.(true);
              setActiveHover?.(`VIEW / ${project.id}`);
            }}
            onPointerMove={handlePointerMove}
            onPointerLeave={resetVisualTilt}
          >
            <div
              aria-hidden="true"
              className="project-watermark pointer-events-none absolute -right-[2vw] top-[8%] select-none text-[clamp(11rem,28vw,32rem)] font-medium leading-none tracking-[-0.11em] text-white/[0.035] md:top-1/2 md:-translate-y-1/2"
            >
              {String(index + 1).padStart(2, "0")}
            </div>

            <div className="relative z-10 mx-auto grid w-full max-w-[1500px] grid-cols-1 items-center gap-9 md:grid-cols-12 md:gap-8 lg:gap-14">
              <div className="project-copy flex flex-col md:col-span-5">
                <div className="project-eyebrow mb-5 flex items-center gap-3 font-mono text-[8px] uppercase tracking-[0.28em] text-white/45 md:mb-7">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: project.accent }}
                  />
                  <span>[{project.id}]</span>
                  <span className="h-px w-8 bg-white/20" />
                  <span>Case {String(index + 1).padStart(2, "0")}</span>
                </div>

                <h2 className="mb-6 text-[clamp(3rem,6.8vw,7.4rem)] font-light lowercase leading-[0.78] tracking-[-0.075em] md:mb-8">
                  {project.name.split(" ").map((word) => (
                    <span
                      key={word}
                      className="block overflow-hidden pb-[0.09em] -mb-[0.09em]"
                    >
                      <span className="project-title-word block will-change-transform">
                        {word}
                      </span>
                    </span>
                  ))}
                </h2>

                <p className="mb-7 max-w-sm text-xs font-light leading-relaxed tracking-wide text-white/45 md:mb-10 md:text-sm">
                  {project.descriptor}
                </p>

                <div className="max-w-md font-mono text-[8px] uppercase tracking-[0.2em] text-white/35 sm:text-[9px]">
                  {[
                    ["Sector", project.sector],
                    ["Role", project.role],
                    ["Timeline", project.year],
                    ["Status", project.status],
                  ].map(([label, value], rowIndex) => (
                    <div
                      key={label}
                      className={`project-meta-row flex items-start justify-between gap-5 border-t border-white/10 py-2.5 ${
                        rowIndex === 3 ? "border-b" : ""
                      }`}
                    >
                      <span>{label}</span>
                      <span
                        className="max-w-[65%] text-right text-white/75"
                        style={
                          label === "Status"
                            ? { color: project.accent }
                            : undefined
                        }
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="project-visual md:col-span-7 md:pl-2">
                <div
                  className="project-visual-tilt relative aspect-[4/3] w-full transform-gpu border border-white/15 bg-[#0d0d0d] shadow-[0_30px_100px_rgba(0,0,0,.55)] will-change-transform md:aspect-[16/10]"
                  style={{
                    transformStyle: "preserve-3d",
                    perspective: "1200px",
                  }}
                >
                  <div
                    aria-hidden="true"
                    className="selected-work-visual absolute inset-2 overflow-hidden border border-white/8 bg-[#0a0a0a] sm:inset-3"
                  >
                    <ProjectVisual type={project.type} />

                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,.055)_46%,transparent_56%)] opacity-50" />
                    <div className="pointer-events-none absolute inset-0 opacity-[0.055] [background-image:radial-gradient(circle_at_center,white_0.6px,transparent_0.8px)] [background-size:5px_5px]" />
                  </div>

                  <span className="absolute left-1.5 top-1 font-mono text-[8px] text-white/30">
                    +
                  </span>
                  <span className="absolute bottom-1 right-1.5 font-mono text-[8px] text-white/30">
                    +
                  </span>

                  <div className="absolute -bottom-7 left-0 flex w-full justify-between font-mono text-[7px] uppercase tracking-[0.24em] text-white/25 md:-bottom-8 md:text-[8px]">
                    <span>Asset / {project.id}</span>
                    <span>Interactive specimen</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-6 left-5 right-5 flex justify-between font-mono text-[7px] uppercase tracking-[0.24em] text-white/25 sm:left-8 sm:right-8 md:hidden">
              <span>{String(index + 1).padStart(2, "0")} / 04</span>
              <span>Scroll ↓</span>
            </div>
          </article>
        ))}
      </div>

      <div className="pointer-events-none absolute bottom-10 right-8 z-50 hidden flex-col gap-2 md:flex lg:right-14">
        {projects.map((project, index) => (
          <span
            key={project.id}
            ref={(element) => {
              indicatorsRef.current[index] = element;
            }}
            className="h-px w-8 origin-right bg-white/20 transition-transform"
            style={{
              backgroundColor:
                index === 0 ? project.accent : "rgba(255,255,255,.18)",
              transform: index === 0 ? "scaleX(1)" : "scaleX(.35)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
