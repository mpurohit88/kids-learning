# Fun Letters - Kids Language Learning App (MVP)

A browser-based web app to help children learn **Hindi**, **Kannada**, **English**, and **Maths** through short, gamified activities. Menus and instructions support **English / Hindi / Kannada** UI locales.

## Features

- **Kid profiles** — create up to 2 learners (name + class); switch anytime from the header or Home
- **Subjects** — Hindi, Kannada, English, Maths
- **Mini-games** — Find the Letter, Picture Match, Trace the Letter, Exam Practice, Maths challenges
- **Progress tracking** — Stars saved per child in browser localStorage
- **Kid-friendly UI** — Large buttons, mascot feedback, encouraging sounds
- **Multi-language UI** — Preferred language for menus (`en` / `hi` / `kn`)

## Quick Start

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Build for Production

```bash
npm run build
npm run preview
```

## Deploy on GitHub Pages (free)

This repo deploys automatically via GitHub Actions on every push to `main`.

1. Open **Settings → Pages**: https://github.com/mpurohit88/kids-learning/settings/pages
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. Push to `main` — the **Deploy to GitHub Pages** workflow runs automatically

**Live URL:** https://mpurohit88.github.io/kids-learning/

> **Note:** Pushing workflow files requires a PAT with the **`workflow`** scope. Create one at https://github.com/settings/tokens if push is rejected.

## Contributor conventions

Keep new work aligned with the existing product — do not invent a parallel UI or string system.

### Multi-language (i18n)

- All **user-facing** copy (labels, prompts, feedback, aria-labels) must use `t('namespace.key')` from `useTranslation()`.
- Add the same keys to **all three** locale files:
  - `src/data/seed/i18n/locales/en.json`
  - `src/data/seed/i18n/locales/hi.json`
  - `src/data/seed/i18n/locales/kn.json`
- Prefer existing namespaces (`common`, `games`, `exam`, `feedback`, `launch`, etc.).
- Learning **content** (letter/word examples in subject JSON) can stay in data files; UI chrome must not be hardcoded English.

### Design & audio

- Reuse existing primitives (`AppShell`, `BigButton`, `Mascot`, `QuizGameShell`) and the same large-touch, colorful kid style.
- Import playback only from `src/utils/audio` (`playLetterSound`, `playWordSound`, `speakText`, `prepareAudio`) — do not add per-page audio paths.
- Cursor agents also follow these rules via `.cursor/rules/i18n-multi-language.mdc` and `.cursor/rules/kid-friendly-design.mdc`.

## Audio Notes

Letter/word audio paths live in subject seed data under `src/data/seed/`. When MP3 files are missing, the app falls back to the browser **Speech Synthesis API**.

To add real recordings, place files under:

```
public/assets/audio/hindi/
public/assets/audio/kannada/
public/assets/audio/english/
```

## Project Structure

```
src/
  components/   # UI components (Mascot, AppShell, etc.)
  data/         # Seed content, i18n locales, repositories
  games/        # Mini-game screens
  pages/        # Navigation screens
  store/        # Zustand + session/progress persistence
  utils/        # Shared audio facade, game helpers
public/assets/  # Images and audio files
.cursor/rules/  # Agent conventions (i18n + design)
```

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Framer Motion
- Zustand (localStorage / sessionStorage persistence)
- React Router
- Howler (SFX) + Speech Synthesis (letter/word fallback)
