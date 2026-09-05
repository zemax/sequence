# Sequence

Sequence is a personal, installable web application for building and running
**Sequences**: ordered lists of full-screen **Steps** (e.g. a countdown timer),
which can be grouped into **Loops** to repeat a set of Steps a given number of
times. Think workout timers, cooking routines, meditation sessions, or any
step-by-step timed routine.

The app is designed to be a Progressive Web App (PWA) that installs on a
smartphone and works fully offline.

See [docs/vision.md](docs/vision.md) for the product goals and
[docs/concepts.md](docs/concepts.md) for the domain model (Sequence, Step, Loop).

## Tech stack

- [Next.js](https://nextjs.org/) 16 (React 19) — app router
- [Redux Toolkit](https://redux-toolkit.js.org/) + React Redux — state management
- [MUI](https://mui.com/) (Material UI) + Emotion — UI components
- [Sass](https://sass-lang.com/) — styling
- [Serwist](https://serwist.pages.dev/) — service worker / PWA / offline support
- [Jest](https://jestjs.io/) + Testing Library — unit/component tests
- TypeScript

## Requirements

- Node.js (LTS recommended)
- npm

## Getting started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

The app is available at [http://localhost:3000](http://localhost:3000).

## Available scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Build the app for production |
| `npm start` | Start the production server (after `npm run build`) |
| `npm run export` | Build a static export of the app into `dist/` (for offline/PWA deployment) |
| `npm run clean` | Remove build artifacts (`dist`, `out`, generated PWA/manifest files) |

## Project structure

```
src/
  app/            Next.js app router pages (routes)
  data/           Redux store, slices, and static app data/copy
  domains/        Feature domains (e.g. sequence) and shared UI components
  styles/         Global Sass styles and assets
docs/             Project documentation
```
