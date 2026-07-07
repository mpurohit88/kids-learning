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

## Deploy on Vercel (free, works with private repo)

The repo includes `vercel.json` for SPA routing. Vercel auto-detects Vite.

1. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub
2. Click **Import** next to `mpurohit88/kids-learning`
3. Keep the defaults:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Click **Deploy**

Your site will be live at a URL like `https://kids-learning.vercel.app` within ~1 minute. Every push to `main` redeploys automatically.

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
