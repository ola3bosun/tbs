# TBS Portfolio 2026

A developer portfolio engineered with an astronomical telemetry and system initialization aesthetic. 
## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Compiler Engine:** Turbopack
- **Styling:** Tailwind CSS v4
- **Data Integration:** Spotify Live Playback API

---

## 🛰 Architecture Highlights

### 1. The Horizon Split Loader
A cinematic boot sequence that replaces traditional loading screens. A custom exponential ease-out counter runs via `requestAnimationFrame` to calibrate system telemetry from `000%` to `100%`. Upon completion, a $1\text{px}$ horizon vector line strikes across the viewport as the layout symmetrically splits open to reveal the canvas.

### 2. Orbital Telemetry Reticle
A performance-optimized custom cursor tracking module. Uses a zero-latency central point paired with a hardware-accelerated (`translate3d`) dashed ring. Interactive elements trigger an expansion, slow technical rotation (`rotate(360deg)`), and target color inversion utilizing `mix-blend-difference`.

### 3. Kinetic Fluid Particle Canvas
An interactive particle array standing in as background micro-dust. Features automated ambient drift vectors that calculate real-time mouse velocity gaps, creating a responsive "solar wind" acceleration effect whenever the user interacts with the page layout.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone [https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git](https://github.com/ola3bosun/tbs.git)
cd now-playing
```

### 2. Configure environment variables
Copy `.env.example` to `.env.local` and fill in your Spotify API credentials:
```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `SPOTIFY_CLIENT_ID` | Client ID from your [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) app |
| `SPOTIFY_CLIENT_SECRET` | Client secret for the same app (keep this private, never commit it) |
| `SPOTIFY_REFRESH_TOKEN` | Long-lived refresh token obtained via the Authorization Code flow |

`.env.local` is gitignored and should never be committed. When deploying (e.g. Vercel), set these same variables in your hosting provider's environment variable settings instead.
