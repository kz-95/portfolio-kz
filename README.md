# Kuan Zhe Huang (ZEN) — Portfolio Website

Awwwards-style landing page for **Kuan Zhe Huang (ZEN)**, Creative Full Stack Developer based in Puchong, Selangor. Features **My Home Servicer** (Angular + Express.js full-stack marketplace) as the hero case study.

Live: [zen-resume.pages.dev](https://zen-resume.pages.dev)

## Stack

Static HTML/CSS/JS — no build step.

- [GSAP 3.13](https://gsap.com) + ScrollTrigger — preloader, reveals, parallax, counters, nav choreography
- [Lenis](https://lenis.darkroom.engineering) — smooth scroll
- [three.js](https://threejs.org) (ESM, dynamic import) — hero arch WebGL shader, CSS-gradient fallback
- Google Fonts — Fraunces, Archivo, Space Mono, DM Serif Display, Outfit

## Setup

### Prerequisites

No build toolchain required. Just a static file server.

Recommended: Node.js ≥ 18 (for `npx serve`).

### Clone & run

```sh
git clone https://github.com/kz-95/beautiful-website.git
cd beautiful-website
npx serve -l 4173 .
```

Open `http://localhost:4173` in your browser.

### Alternatives

**Python:**
```sh
python -m http.server 4173
```

**VS Code:** Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension, right-click `index.html` → Open with Live Server.

**Windows batch shortcut** (included):
```bat
run.bat
```

> Direct `file://` open will break WebGL and font loading due to CORS. Always use a local server.

## Project structure

```
.
├── index.html          # Single-page entry point — all sections
├── css/
│   └── style.css       # All styles, CSS custom properties, animations
├── js/
│   └── main.js         # GSAP, Lenis, cursor, preloader, arch shader
└── run.bat             # Windows quick-start (npx serve)
```

## Customisation

All personal content lives in `index.html`. Key variables in `css/style.css`:

```css
--c-ink:    #1a1a18;   /* primary text */
--c-paper:  #f1f1ec;   /* background */
--c-accent: #2b3ff2;   /* electric cobalt */
```

## Features

- WebGL doorway arch (three.js fbm flow-field shader, mouse-reactive + scroll-parallaxed)
- Magnetic cursor with context labels
- Smooth scroll via Lenis
- Animated preloader with percentage counter
- Scroll-triggered reveals (GSAP ScrollTrigger)
- Animated stat counters
- Responsive (375 px → desktop), full-screen mobile menu
- `prefers-reduced-motion` respected — disables WebGL, preloader, reveals

## Contact

- Email: [coffeeinveins@gmail.com](mailto:coffeeinveins@gmail.com)
- LinkedIn: [linkedin.com/in/zenkuan](https://www.linkedin.com/in/zenkuan/)
- GitHub: [github.com/AllergicToAnything](https://github.com/AllergicToAnything)
- ArtStation: [kze.artstation.com](https://kze.artstation.com)
