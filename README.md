<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://readme-typing-svg.demolab.com?font=Fraunces&weight=560&size=40&duration=2800&pause=1000&color=E8820C&center=true&vCenter=true&width=600&lines=ZEN+KUAN;KUAN+ZHE+HUANG">
    <img src="https://readme-typing-svg.demolab.com?font=Fraunces&weight=560&size=40&duration=2800&pause=1000&color=2B3FF2&center=true&vCenter=true&width=600&lines=ZEN+KUAN;KUAN+ZHE+HUANG" alt="ZEN KUAN" />
  </picture>
</p>

<p align="center">
  <strong>Creative Full Stack Developer</strong> — Puchong, Selangor, Malaysia<br/>
  <em>End-to-end builds where engineering meets art direction.</em>
</p>

<p align="center">
  <a href="https://kze.dpdns.org"><img src="https://img.shields.io/badge/Live-kze.dpdns.org-2b3ff2?style=flat-square" alt="Live Site" /></a>
  <a href="https://github.com/kz-95/beautiful-website"><img src="https://img.shields.io/badge/Source-GitHub-14161b?style=flat-square&logo=github" alt="GitHub" /></a>
  <a href="https://www.linkedin.com/in/zenkuan/"><img src="https://img.shields.io/badge/LinkedIn-zenkuan-0a66c2?style=flat-square&logo=linkedin" alt="LinkedIn" /></a>
</p>

---

A data-driven, single-page portfolio with WebGL shaders, smooth scrolling, dark mode, SPA-style routing, and a contact modal — no frameworks, no build step.

<p align="center">
  <kbd><strong>Day</strong> — cobalt &amp; cream</kbd>
  &ensp;·&ensp;
  <kbd><strong>Night</strong> — amber &amp; charcoal</kbd>
</p>

## Tech

| Layer | Tech |
|---|---|
| **Animation** | [GSAP 3.13](https://gsap.com) + ScrollTrigger — preloader, reveals, parallax, counters |
| **Smooth Scroll** | [Lenis 1.1](https://lenis.darkroom.engineering) |
| **WebGL** | [Three.js](https://threejs.org) (ESM, dynamic import) — hero-arch flow-field shader |
| **Routing** | Custom hash-based SPA router with history |
| **Data** | `data.json` — all content, driven through `render.js` |
| **Fonts** | Fraunces, Archivo, Space Mono, DM Serif Display, Outfit (Google Fonts) |
| **Contact** | Formspree — async submission with inline status |

## Project Structure

```
.
├── index.html              # Single-page shell — sections populated at runtime
├── data.json               # All content, copy, links, and gallery data
├── vercel.json             # SPA rewrites for clean URLs
├── css/
│   └── style.css           # Full stylesheet — custom properties, animations, responsive
├── js/
│   ├── data.js             # Fetches & hydrates data.json
│   ├── selectors.js        # DOM reference cache
│   ├── render.js           # Data → DOM rendering engine
│   ├── router.js           # Hash-based SPA router
│   ├── contact-modal.js    # Contact form logic & Formspree integration
│   ├── work-detail.js      # Case-study lightbox overlay
│   ├── service-detail.js   # Service description lightbox
│   ├── hacker-decode.js    # Glitch/decode text animation
│   ├── theme.js            # Dark/light toggle with system preference detection
│   └── main.js             # Entry — GSAP, Lenis, Three.js arch, cursor, preloader
├── img/                    # Portrait, mockups, placeholder gallery
├── tools/
│   └── dev-save-server.mjs # Local dev-server for the CSS-override resizer
└── run.bat                 # Windows one-click launcher
```

## Quick Start

**Prerequisites:** Node.js ≥ 18 (for `npx serve`), or Python 3, or VS Code Live Server.

```sh
git clone https://github.com/kz-95/beautiful-website.git
cd beautiful-website
```

### Option A — `run.bat` (Windows)

Double-click `run.bat`. It auto-kills stale port listeners, starts a local save-server for dev tooling, and opens `http://localhost:4173`.

### Option B — `npx serve`

```sh
npx serve -l 4173 .
```

### Option C — Python

```sh
python -m http.server 4173
```

### Option D — VS Code Live Server

Install [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer), right-click `index.html` → **Open with Live Server**.

> Opening `index.html` directly via `file://` will break WebGL and font loading due to CORS. Always use a local server.

## Build & Deploy

**No build step.** Push to `main` and let your host serve the static files.

### Vercel

`vercel.json` is pre-configured with SPA rewrites (`/resume`, `/work/:id`, `/services/:id`, `/contact`). Simply connect the repo and deploy.

```sh
vercel        # preview
vercel --prod # production
```

**Live:** [kze.dpdns.org](https://kze.dpdns.org)

### Cloudflare Pages

| Setting | Value |
|---|---|
| Framework preset | None |
| Build command | _(leave empty)_ |
| Output directory | `/` |

```sh
wrangler pages deploy . --project-name=site02
```

## Customisation

Edit `data.json` for all copy, links, gallery images, theme tokens, and socials. The rendering layer (`js/render.js`) consumes it at runtime — no HTML patches needed.

Key design tokens live in `css/style.css` as custom properties and in `data.json → theme` for the dual dark/light palette:

| Token | Day | Night |
|---|---|---|
| Background | `#f1f1ec` | `#16161a` |
| Text | `#14161b` | `#ededec` |
| Accent | `#2b3ff2` (cobalt) | `#e8820c` (amber) |

## Features

- **WebGL hero arch** — three.js flow-field fragment shader, mouse-reactive + scroll-parallaxed, falls back to CSS gradient
- **Dual theme** — system-preference detection with manual toggle, persisted in `localStorage`
- **Animated preloader** — percentage counter with GSAP-driven curtain reveal
- **Smooth scroll** — Lenis with directional awareness and nav choreography
- **SPA routing** — hash-based router with push-state history, deep-linkable work & service detail overlays
- **Magnetic cursor** — context-aware labels (view, drag, open) on interactive targets
- **Scroll-triggered reveals** — GSAP ScrollTrigger with staggered text, image, and stat animations
- **Responsive** — 375 px through desktop, full-screen mobile nav with animated burger
- **Contact modal** — Formspree-powered, no redirect, inline success/error states
- **`prefers-reduced-motion`** — disables WebGL, preloader, and scroll reveals
- **Dev tooling** — local-only CSS-override resizer with save-server (never shipped; gitignored)

## Contact

- **Email:** [coffeeinveins@gmail.com](mailto:coffeeinveins@gmail.com)
- **LinkedIn:** [linkedin.com/in/zenkuan](https://www.linkedin.com/in/zenkuan/)
- **GitHub:** [github.com/kz-95](https://github.com/kz-95)
- **ArtStation:** [kze.artstation.com](https://kze.artstation.com)
- **Instagram:** [@zen.k.z](https://www.instagram.com/zen.k.z/)

---

<p align="center">
  <sub>Designed &amp; built in Puchong · © 2026 Kuan Zhe Huang</sub>
</p>
