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

## Desired features

- **Bug — the duration field always shows a leading zero**: when editing a
  Countdown's duration, the number input keeps a `0` at the start and it can't
  be deleted (the field coerces an emptied value back to `0`). The field should
  let the user clear it and type a fresh value.
- **Look into a native duration picker**: check whether a duration selector
  built into the browser could replace the plain number input (in seconds) used
  today, and whether it is good enough on phones, where the app is meant to run.
- **Delete by dragging to a "Supprimer" zone at the top**: instead of dragging
  an item to the right edge of the screen, a "Supprimer" zone would appear at the
  top of the screen while an item is being dragged, and dropping the item on it
  would delete it (confirmation included), like removing an icon on Android.
  This would replace the current right-edge deletion for Sequences and Steps.
- **Quick fade transitions between screens**: navigating from one screen to
  another (list, editor, player, settings) should cross-fade quickly by
  transparency — the old screen fading out and the new one fading in — instead
  of switching instantly.

## Non-goals

- Cloud sync or multi-device account — data stays local to the installed app.
  Moving a Sequence between devices is done via JSON export/import, not sync.
- User accounts or authentication.

These may be revisited later, but are out of scope for the current direction.
