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
  move on, and inside a Loop a "Passer la boucle" control skips the rest of the
  Loop — see [concepts.md](concepts.md#current-implementation-status).
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
- **Sound per Step**: a short sound plays whenever a Step ends (Countdown
  elapsing, a Pause tap, or Next). A Settings switch mutes it, and a slider
  picks one of four sounds, from the discreet default to a loud alarm — see
  [concepts.md](concepts.md#current-implementation-status).

- **Quick fade between screens**: navigating between the list, the editor, the
  player and Settings fades the current screen out and the next one in (about
  120 ms each), by transparency — see
  [concepts.md](concepts.md#current-implementation-status).

- **Clear drag cues around Loops**: while a Step is dragged, a single cue shows
  where it lands — the Loop highlighted with an insertion bar when dropping into
  it, a dashed Loop with a bar below it when taking the Step out — see
  [drag-reorder.md](drag-reorder.md).

- **Delete by dragging to a "Supprimer" zone**: a zone appears at the bottom of the
  screen while an item is dragged, and dropping the item on it deletes it
  (confirmation included), like removing an icon on Android — see
  [drag-reorder.md](drag-reorder.md).

## Desired features

- **Look into a better duration picker**: the plain number input (in seconds)
  stays for now. A native control was investigated and ruled out: browsers have
  no duration control (`type="duration"` does not exist), and `type="time"` is a
  time of day, shown as AM/PM depending on the device locale, whose phone pickers
  (iOS, Android) only offer hours and minutes, losing the seconds the app needs.

## Non-goals

- Cloud sync or multi-device account — data stays local to the installed app.
  Moving a Sequence between devices is done via JSON export/import, not sync.
- User accounts or authentication.

These may be revisited later, but are out of scope for the current direction.
