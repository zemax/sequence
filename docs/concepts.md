# Core Concepts

This document describes the domain model of the Sequence application: the vocabulary
used across the codebase, the UI, and this documentation.

## Sequence

A **Sequence** is the top-level object the user creates and runs. It is an ordered
list of **Steps** (and, optionally, **Loops** of Steps).

A Sequence has:
- a `name` (user-editable, freeform text)
- an ordered list of items, where each item is either a Step or a Loop

Typical use case: a workout routine, a cooking timer sequence, a meditation session,
a presentation timer — anything that walks a user through a series of timed or
manual steps, one screen at a time.

## Step

A **Step** is a single unit of the Sequence. When the Sequence is played, each Step
is displayed full-screen in order.

Every Step has:
- a `title` (customizable, shown on screen while the Step is active)
- a `type`, which determines its behavior and which extra fields it exposes

### Step types

The application is designed to support multiple Step types. Each type shows its own
screen and defines its own configurable fields.

- **Countdown** — displays its title on screen for a configurable `duration`
  (e.g. seconds), then automatically advances to the next item in the Sequence.
- **Pause** — displays its title on screen and waits indefinitely; the user must
  tap/press to advance to the next item in the Sequence.

Other Step types (e.g. a message/instruction step) can be added later following the
same pattern: a title, zero or more type-specific fields, and a defined on-screen
behavior.

### Step components

Each Step type lives in its own directory under `src/domains/steps/<type>/` and
owns its own interface (e.g. `CountdownStep`, `PauseStep`) plus three components,
named after the type to avoid ambiguity:
- **`<Type>Edit`** — the fields used to create/edit a Step of that type in the
  Sequence authoring form.
- **`<Type>Preview`** — a compact, read-only summary of the Step, shown in a
  Sequence's item list while a different Step is being edited.
- **`<Type>View`** — the full-screen component used during playback; it renders
  the Step and calls `onDone()` once its condition to advance is met (a
  Countdown's timer elapsing, a Pause's tap/press).

`src/domains/steps/common/StepEdit.tsx`, `StepPreview.tsx`, and `StepView.tsx` each
dispatch to the right type's component based on the Step's `type` discriminant, so
callers (the Form, and later the Sequence player) don't need to know about
individual Step types. The `Step` union itself stays in
[sequencesSlice.ts](../src/data/sequences/sequencesSlice.ts), which imports each
type's interface from its directory.

No `index.ts` barrel files are used in this codebase — every file is named after
its main export (`CountdownEdit.tsx` exports `CountdownEdit`, etc.) and imported
by its explicit path.

## Loop

A **Loop** is a container that groups one or more Steps and repeats them a
configurable number of times.

A Loop has:
- an ordered list of Steps it contains
- a `repeatCount` (how many times the contained Steps are played in a row)

Loops let a Sequence express repetitive structures (e.g. "do these 3 steps, 5 times
in a row") without duplicating the same Steps manually. Loops contain Steps, not
other Loops (no nesting), keeping the model simple to author and to play back.

## Putting it together

```
Sequence
 ├─ Step (Countdown: "Warm up", 30s)
 ├─ Loop (x5)
 │   ├─ Step (Countdown: "Push-ups", 20s)
 │   └─ Step (Countdown: "Rest", 10s)
 └─ Step (Countdown: "Cool down", 30s)
```

When played, the Sequence above shows: "Warm up" (30s), then "Push-ups" / "Rest"
five times in a row, then "Cool down" (30s).

## Playback

Playing a Sequence walks through its items (Steps and Loops) in order:
- a Step is displayed until its own condition ends it (e.g. a Countdown's duration
  elapses, or a Pause's tap/press), then the next item plays
- a Loop replays its contained Steps in order, `repeatCount` times, before moving on
  to the next item in the parent Sequence

## Current implementation status

The data model described above is implemented across
[sequencesSlice.ts](../src/data/sequences/sequencesSlice.ts) (a `Sequence` holds an
ordered `items: SequenceItem[]`, where `SequenceItem` is a `Step` or a `Loop { id,
type: "loop", steps, repeatCount }`) and each Step type's own directory under
[src/domains/steps](../src/domains/steps) (`CountdownStep { id, type: "countdown",
title, duration }` in `steps/countdown/`, `PauseStep { id, type: "pause", title }`
in `steps/pause/`).

### Authoring — done

[SequenceForm.tsx](../src/domains/sequence/SequenceForm.tsx) lets a user edit a
Sequence's `name`, and delegates its `items` to
[StepList.tsx](../src/domains/steps/common/StepList.tsx), which handles adding
Steps or Loops, editing an existing item in place (tapping a `<Type>Preview`
swaps it for its `<Type>PreviewEdit`), deleting an item by dragging it to the
screen edge (after a "Supprimer ?" confirmation), and reordering items by dragging — all via the same
[SortableList](../src/domains/ui/sortableList) used for Sequences on the home
screen (see [drag-reorder.md](drag-reorder.md)).

On the home screen ([HomePage.tsx](../src/routes/HomePage.tsx): a "Séquences"
title with the Settings button on its right, then the list, then a floating
"Nouvelle séquence" button),
[SequenceList.tsx](../src/domains/sequence/SequenceList.tsx) supports the same
drag-and-drop reordering for Sequences themselves. While editing, the form
shows the Sequence's total duration under its name, recomputed live.

**Loops can be created and edited.** `StepList` is shared between a Sequence's
top-level items (passed `allowLoop`) and, nested, a Loop's own Steps. With
`allowLoop`, its "add" row includes a
[LoopButton](../src/domains/steps/loop/LoopButton.tsx) alongside Countdown and
Pause, which adds an empty Loop (`emptyLoop()` — `repeatCount: 2`, no Steps)
and opens it for editing immediately.
[LoopPreview.tsx](../src/domains/steps/loop/LoopPreview.tsx) renders a Loop as
a translucent container whose header holds the `repeatCount` stepper (− / +,
never below 1), above a permanently-expanded body holding a second, nested
`StepList` for its Steps (an empty body shows a dashed drop zone).
That nested list never sets `allowLoop` — Loops can't contain Loops — and has
no add row of its own: Steps only ever populate a Loop's body by being dragged
into it. Two `SortableList` capabilities (see
[drag-reorder.md](drag-reorder.md)) make that possible: dragging an existing
Step onto a Loop row nests it there (`isDropTarget`/`onDropInto`), and
dragging a Step in a Loop's body out past the Loop's own bounds ejects it back
into the parent list, right after that Loop (`containerRef`/
`onEscapeContainer`).

### Navigation — done

[ScreenTransition.tsx](../src/domains/ui/components/ScreenTransition/ScreenTransition.tsx)
wraps the routes in `App.tsx`. When the path changes it keeps rendering the
current screen for about 120 ms while fading it out, then renders the new one
(passing the displayed location to `Routes`) and fades it in. The gradient
background belongs to the wrapper, not to `Page`, so it stays put and only the
content fades. With `prefers-reduced-motion` the swap is immediate.

### Playback — done

[SequenceView.tsx](../src/domains/sequence/SequenceView.tsx) is the full-screen
player, routed at `/sequence/view/:id`. It flattens a Sequence's `items` into a
single ordered list of entries up front
([flattenPlayback.ts](../src/domains/sequence/flattenPlayback.ts)) — a `Loop`
expands into its contained Steps repeated `repeatCount` times — and walks
through that list one `StepView` at a time. Each entry coming from a Loop
remembers which iteration it belongs to and the index where the whole Loop
ends (`exitIndex`), which is all the player needs to show "Boucle · 2/4" and to
skip the rest of the Loop.

The screen is laid out top to bottom as: a header (**Back**, which exits to the
home screen, and the Sequence's name), a progress bar of how far through the
flattened Steps playback is, the current Step, its controls, and a card at the
bottom ([UpNextCard.tsx](../src/domains/sequence/UpNextCard.tsx)). The controls
are **Previous** (hidden on the first Step), a large central button, and
**Next**. Next doubles as the "skip" affordance described in
[vision.md](vision.md) — it forces the current Step to end immediately, the
same way a Countdown's timer elapsing or a Pause's tap does. The central button
is pause/resume for a Countdown (the paused state lives in `SequenceView` and is
passed down to `CountdownView`, and reset whenever the Step changes) and
"continue" for a Pause. Passing the last Step navigates back to the home screen
automatically, with no intermediate "sequence complete" screen.

The bottom card previews the next Step ("À suivre": title, plus its duration for
a Countdown; no row on the last Step). While a Loop is playing, the card gains a
header with the iteration ("Boucle · 2/4") and **Passer la boucle**, which jumps
straight to the entry after the Loop (the sound plays as for any Step end; if the
Loop was the end of the Sequence, playback finishes).

The playback screen is exactly one viewport tall and never scrolls (`Page`'s
`fullscreen` mode; only viewports shorter than 600px fall back to scrolling),
down to an iPhone SE's 375x667. Every Step type lays itself out with
[StepStage.tsx](../src/domains/steps/common/StepStage.tsx): a size container
holding a `1fr / ring / 1fr` grid, with the title centered in the top row
(between the progress bar and the ring), the ring in the middle row and the
controls in the bottom row, starting a fixed gap under the ring. The ring row
has the same height for a Step without a ring (`PauseView`, whose title spans
the top two rows), so the controls sit at the same place on every Step.

The ring is centered on the *screen*, not just on the Step area: since more
chrome sits below the Step area than above it, `SequenceView` exposes the
difference as `--stage-bias`, and the area is stretched down by that amount
(negative bottom margin, behind the card) so its center is the screen's
center. The ring's diameter is the smallest of 280px, the area's width, and
what leaves room for the controls and the card below it, so it shrinks on short
screens (to about 160px on a 375x667 screen when the Sequence contains a Loop,
about 250px when it doesn't). The card's slot is bottom-aligned and has a fixed
height — large enough for the Loop header whenever the Sequence has any Loop —
so the Step area never changes size from one Step to the next, in or out of a
Loop; outside a Loop the card simply gets shorter and leaves a gap above it.
Below 740px of height, the controls, the card's title (one line instead of two)
and the Step title all tighten up.

`CountdownView`'s ring surrounds an mm:ss clock, which freezes the ring and
blinks while paused. Its timer is driven by comparing `Date.now()` against a recorded start time on
every `requestAnimationFrame` tick, rather than counting `setTimeout` firings —
this keeps it accurate (no drift, no stalling) even if the tab is throttled in
the background, at the cost of only updating when a frame is actually painted.
`PauseView`'s title area is its tap target — tapping it advances, the same as
the central "continue" button.

`SequenceView` also holds a screen wake lock for as long as it's mounted, via
[useWakeLock.ts](../src/domains/sequence/useWakeLock.ts): it requests one on
mount and re-requests on `visibilitychange` (the OS releases any wake lock
the moment a tab goes hidden, so it doesn't survive being backgrounded on its
own), and releases it on unmount. Acquisition failures (unsupported browser,
non-visible document, low battery mode, etc.) are swallowed silently —
playback works the same either way, it just risks the screen sleeping.

Every time a Step ends — a Countdown elapsing, a Pause tap, or Next —
`SequenceView`'s `goToNext` plays a short synthesized sound via
[playStepEndSound.ts](../src/domains/sequence/playStepEndSound.ts) (plain Web
Audio oscillators, no audio asset to ship), unless the `soundMuted` setting (see
Data & Settings below) is on. There are four sounds, picked by the `soundLevel`
setting: 1 is the discreet single beep, 2 a two-note chime, 3 a louder
three-note triangle melody and 4 a square-wave triple-beep alarm. Browsers keep a new `AudioContext`
suspended unless it is created or resumed during a user gesture — which a
countdown ending by itself never is, and the first beep would be silent — so
`SequenceView` creates it as soon as playback starts (and on every pointer
down), and the beep resumes it before sounding if it is still suspended.

### Data & Settings — done

Sequence data is persisted to `localStorage`
([localStorageSequences.ts](../src/data/localStorageSequences.ts)): the Redux
store preloads from it on startup and
[store.ts](../src/data/store.ts) writes the full `sequences` state back on
every change via `store.subscribe`. A missing or invalid value falls back to
the built-in example Sequences (`initialSequences`, exported from
[sequencesSlice.ts](../src/data/sequences/sequencesSlice.ts), which imports
its data from [fixtures/examples.json](../src/data/fixtures/examples.json)).

[Settings.tsx](../src/domains/settings/Settings.tsx) adds three actions on
top of that: **Export** downloads all Sequences as a single JSON file
(the raw `Sequence[]` array, no envelope); **Import** reads a JSON file,
confirms with the user, then replaces the entire local Sequence list with
its contents (`setSequences`) — there is no merge option; **Reset** asks "Réinitialiser ?" in the same small
[ConfirmDialog](../src/domains/ui/components/ConfirmDialog/ConfirmDialog.tsx) used
for deletions (X cancels, check confirms), with a line explaining the consequences
under the title (the dialog takes an optional `message`),
then restores `initialSequences` (`resetSequences`, deep-cloned so the
fixtures object itself is never mutated across resets).

A separate `settings` slice
([settingsSlice.ts](../src/data/settings/settingsSlice.ts)), persisted the
same way via [localStorageSettings.ts](../src/data/localStorageSettings.ts),
holds two values: the `soundMuted` flag and the `soundLevel` (1 to 4, default
1). The "Jouer les sons" switch shows `soundMuted` inverted (on = sounds play),
and its speaker icon follows the state: a speaker when sounds are on, a
crossed-out one when muted. The flag itself stays `soundMuted` so values already
persisted on devices keep working; `loadSettings` fills in a missing or
out-of-range `soundLevel` for the same reason.

Below the switch, [SoundLevelSlider.tsx](../src/domains/settings/SoundLevelSlider.tsx)
picks the level: a bar with four graduations and a thumb that snaps to the
nearest one while it is dragged (or tapped, or moved with the arrow keys), and
that plays the sound of each level as the thumb lands on it, so the user hears
what they choose. It is dimmed and inert while sounds are muted.

The Settings page is organised as titled groups of white cards, each row a
round icon plus a label: a "Sons" group (the mute switch and the sound level slider), a "Données" group
(Export, Import) and, on its own, a Reset row in the action color. Rows are
plain buttons (or, for the switch, a label), so they stack uniformly.
