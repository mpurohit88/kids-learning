# Fun Letters - Kids Language Learning App (MVP)

A browser-based web app to help children learn **Hindi** and **Kannada** alphabets, sounds, and basic vocabulary through short, gamified activities.

## Features

- **Profile picker** — Aarav (Age 4, LKG) and Diya (Age 7, Class 2)
- **Two languages** — Hindi and Kannada with 15 letters and 20 vocabulary words each
- **Three mini-games:**
  - Find the Letter
  - Picture Match
  - Trace the Letter
- **Progress tracking** — Stars saved per child in browser localStorage
- **Kid-friendly UI** — Large buttons, mascot feedback, encouraging sounds

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

This repo includes a GitHub Actions workflow that deploys automatically on every push to `main`.

1. Open **GitHub repo → Settings → Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. Push to `main` — the workflow builds and publishes the site

**Live URL:** https://skilltect-technologies.github.io/kids-learning/

Local development is unchanged (`npm run dev` at `http://localhost:5173`).

## Audio Notes

Audio file paths are defined in `src/data/hindi.json` and `src/data/kannada.json`. When MP3 files are missing, the app falls back to the browser **Speech Synthesis API** (Hindi: `hi-IN`, Kannada: `kn-IN`).

To add real recordings, place files under:

```
public/assets/audio/hindi/
public/assets/audio/kannada/
```

## Project Structure

```
src/
  components/   # UI components (Mascot, AppShell, etc.)
  data/         # JSON content + profiles
  games/        # Mini-game screens
  pages/        # Navigation screens
  store/        # Zustand + localStorage progress
  utils/        # Audio player, game helpers
public/assets/  # Images and audio files
```

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Framer Motion
- Zustand (localStorage persistence)
- React Router
