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

## Desired features

- **Pause / Resume**: while a Sequence is playing, the user can pause playback
  (e.g. a Countdown Step's timer stops) and resume it later from the same point.
- **Skip**: while a Sequence is playing, the user can skip the current Step, or
  the current Loop entirely, and move on to the next item in the Sequence.
- **Export/Import as JSON**: a Sequence can be exported to a JSON file and
  imported back, so Sequences can be backed up or moved between devices
  without requiring a cloud account.

## Non-goals

- Cloud sync or multi-device account — data stays local to the installed app.
  Moving a Sequence between devices is done via JSON export/import, not sync.
- User accounts or authentication.

These may be revisited later, but are out of scope for the current direction.
