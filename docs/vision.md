# Product Vision

Sequence is a personal project: an installable web application for managing and
running **Sequences** — see [concepts.md](concepts.md) for the full domain model
(Sequence, Step, Loop).

## Goals

- **Offline-first**: the app must be fully usable without a network connection
  once installed. All Sequence data lives on the device.
- **Installable on smartphone**: the app is a Progressive Web App (PWA) that can
  be added to a phone's home screen and launched like a native app.
- **Simple authoring**: creating and editing a Sequence (its Steps and Loops)
  should be quick and require no external tools.
- **Full-screen playback**: running a Sequence should be legible at a glance —
  each Step takes over the screen with its title and relevant state (e.g. a
  countdown timer).

## Features

- **Pause / Resume**: while a Sequence is playing, the user can pause a
  Countdown Step's timer and resume it later from the same point.
- **Skip**: a "Next" control always lets the user skip the current Step and
  move on. Skipping *the current Loop entirely* still isn't meaningful, since
  Loops can't be authored yet — see
  [concepts.md](concepts.md#current-implementation-status).

## Desired features

- **Export/Import as JSON, from Settings**: a Sequence can be exported to a
  JSON file and imported back from the Settings page, so Sequences can be
  backed up or moved between devices without requiring a cloud account.
- **Local persistence**: Sequence data currently lives only in memory (the
  Redux store resets on reload) — edits need to be saved on the device (e.g.
  `localStorage`) so they survive a reload or app restart, which the
  offline-first goal above already assumes.
- **Sound per Step**: play a sound when a Step starts (or ends), so playback
  stays legible without having to look at the screen.
- **Sound customization & mute, in Settings**: let the user pick which sound
  plays, or turn it off entirely, from the Settings page.
- **Factory reset, from Settings**: a Settings action to wipe all local
  Sequence data and start fresh.
- **Keep the screen awake during playback**: detect whether the browser
  would let the screen sleep while a Sequence is playing and, if so, request
  a wake lock (Screen Wake Lock API) to prevent it — a Sequence shouldn't get
  interrupted by the device locking itself mid-way through.

## Non-goals

- Cloud sync or multi-device account — data stays local to the installed app.
  Moving a Sequence between devices is done via JSON export/import, not sync.
- User accounts or authentication.

These may be revisited later, but are out of scope for the current direction.
