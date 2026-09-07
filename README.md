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

- [Vite](https://vite.dev/) + [React](https://react.dev/) 19
- [React Router](https://reactrouter.com/) — routing
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
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build a static production bundle into `dist/` |
| `npm run preview` | Serve the production build from `dist/` locally |
| `npm run clean` | Remove build artifacts (`dist`) |

## Project structure

```
src/
  routes/         Top-level route components (React Router)
  data/           Redux store, slices, and static app data/copy
  domains/        Feature domains (e.g. sequence) and shared UI components
  styles/         Global Sass styles and assets
  App.tsx         Router + Redux provider setup
  main.tsx        App entry point
  sw.ts           Service worker source (built by @serwist/vite)
docs/             Project documentation
```
