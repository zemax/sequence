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
  move on. Skipping *the current Loop entirely* still isn't possible — see
  [concepts.md](concepts.md#current-implementation-status).
- **Local persistence**: Sequence data is saved to `localStorage` on every
  change and reloaded on startup, so it survives a reload or app restart —
  see [concepts.md](concepts.md#current-implementation-status).
- **Export/Import as JSON, from Settings**: all Sequences can be exported to
  a JSON file from the Settings page, and a JSON file can be imported back
  (replacing all local Sequences, after confirmation) — so Sequences can be
  backed up or moved between devices without requiring a cloud account.
- **Factory reset, from Settings**: a Settings action wipes all local
  Sequence data and restores the built-in example Sequences.
- **Keep the screen awake during playback**: while a Sequence is playing, the
  app requests a wake lock (Screen Wake Lock API) so the device doesn't lock
  itself mid-way through — see
  [concepts.md](concepts.md#current-implementation-status).
- **Sound per Step**: a short beep plays whenever a Step ends (Countdown
  elapsing, a Pause tap, or Next), and a Settings switch mutes it — see
  [concepts.md](concepts.md#current-implementation-status).

## Desired features

- **Sound customization, in Settings**: let the user pick which sound plays
  per Step, instead of the one built-in beep.

## Non-goals

- Cloud sync or multi-device account — data stays local to the installed app.
  Moving a Sequence between devices is done via JSON export/import, not sync.
- User accounts or authentication.

These may be revisited later, but are out of scope for the current direction.
