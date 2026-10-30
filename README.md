# NewPortf — Ayoub Akouhar's Portfolio

An animated personal portfolio presenting Ayoub Akouhar's systems and backend projects, education, technical skills, contributions, and contact information. Built with React 19, TypeScript, Vite, GSAP, and Lenis.

## Features

- Seven scroll-driven sections: introduction, about, work, journey, skills, contributions, and contact.
- A transparent 239-frame animation rendered on canvas alongside CSS 3D elements.
- Smooth scrolling, magnetic buttons, and responsive desktop and mobile layouts.
- Local fonts, animation assets, and a downloadable résumé.

## Project structure

- `src/scenes/`: the seven portfolio sections.
- `src/engine/`: animation timing, frame loading, and shared helpers.
- `src/components/`: the canvas stage and reusable interface components.
- `src/data.ts`: portfolio text, projects, skills, and profile links.
- `public/`: ready-to-use animation frames and résumé.
- `scripts/` and `tests/`: asset preparation, browser checks, and engine tests.

A local Vite + React + TypeScript portfolio, driven by a transparent 239-frame performance. Seven scenes share one GSAP ticker, Lenis, a canvas stage, and CSS 3D elements. GSAP `quickTo` is used only for magnetic buttons.

## Run

Use Node.js 22.12+ and npm. Clone the repository and install dependencies:

```bash
git clone https://github.com/ayoakouh/NewPortf.git
cd NewPortf
npm install
npm run dev
```

Open the local URL printed by Vite. Node.js 22.12+ is recommended. All runtime assets, fonts, and the résumé are local; the site does not need external profile APIs to render.

```bash
npm run typecheck
npm test
npm run build
npm run preview
```

Vite uses `base: './'`. Deploy the contents of `dist/` as a static site. The résumé is copied unchanged to `public/resume.pdf`.

For static hosting, use `npm run build` as the build command and `dist` as the output directory. Preview the production build locally with `npm run preview`.

## Content

Edit `src/data.ts` for copy, profile links, metrics, projects, skills, and contribution cards. External statistics are a dated snapshot, not live counters. CGPA is unavailable and displays N/A. No certifications are claimed.

The featured projects come from the supplied résumé. The HTTP Web Server links to the GitHub profile because a specific public repository could not be verified. Inception links to the verified `inception01` repository; the `Inception` repository is empty. The contribution cylinder contains two verified merged OpenClaw fixes and three selected projects. LeetCode and NeetCode are separate profile links; NeetCode has no unverified numeric claims. Education begins in 2024; no graduation claim is made.

## Rebuild video assets

The generated assets are included, so Python is unnecessary for normal development. To reproduce them, keep the original MP4 one directory above this project, or pass `--source /absolute/path/to/video.mp4`.

```bash
python3 -m venv .venv
.venv/bin/pip install -r scripts/requirements.txt
.venv/bin/python scripts/prepare_frames.py --calibrate
.venv/bin/python scripts/prepare_frames.py
```

The first run downloads the `u2net_human_seg` model. FFmpeg is supplied by `imageio-ffmpeg`; a system FFmpeg install is not required. `full/` and `.cache/` are regenerable intermediates. The source is 1920×1080, 24 fps, with 239 extracted frames and no detected hard cuts. Logical shot ranges are `[0,59]`, `[60,119]`, `[120,179]`, and `[180,238]`.

The gray studio requires a fitted spatial background field instead of assuming white=247. The pipeline retains the specified morphology and alpha stages, removes disconnected studio equipment and gray floor shadows, and preserves the person and furniture. Inspect `qa/contact-sheets/matte-red.jpg` before accepting a regenerated sequence. Outputs use per-shot union crops, shared virtual coordinates, and person-only horizontal centers.

## Browser verification

Start the dev server first, then:

```bash
npm run qa
```

Use `QA_ONLY=skills npm run qa` (or `work` / `contact`) for a focused recheck. The visual review notes and reports are in `qa/REVIEW.md`.

The script expects Chromium at `/usr/bin/chromium`. Override `CHROMIUM_PATH` or `QA_URL` as needed. It captures the introduction, three positions per section, all six blade midpoints, both sides of the Contact HUD threshold, and cylinder endpoints at 1600×900 and 390×844. Screenshots are saved under `qa/screenshots/`; the machine-readable report is `qa/report.json`. It also checks browser errors, horizontal overflow, résumé delivery, navigation, and resize handling.

Frame loading begins with shot boundaries, then strides 8→4→2→1. The preloader releases at the first quarter of decoded frames; the remaining frames stream in. Unavailable frames fall back only within their original shot. A failed sequence produces a loading error rather than silently substituting imagery.
