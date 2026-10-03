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
screen edge, and reordering items by dragging — all via the same
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

### Playback — done

[SequenceView.tsx](../src/domains/sequence/SequenceView.tsx) is the full-screen
player, routed at `/sequence/view/:id`. It flattens a Sequence's `items` into a
single ordered list of Steps up front — a `Loop` expands into its contained
Steps repeated `repeatCount` times, so the player itself never needs to know
about Loops as a distinct concept during playback — and walks through that list
one `StepView` at a time.

The screen is laid out top to bottom as: a header (**Back**, which exits to the
home screen, and the Sequence's name), a progress bar of how far through the
flattened Steps playback is, the current Step, a controls row, and an "À suivre"
card previewing the next Step (title, plus its duration for a Countdown; hidden
on the last Step). The controls row is **Previous** (hidden on the first Step),
a large central button, and **Next**. Next doubles as the "skip" affordance
described in [vision.md](vision.md) — it forces the current Step to end
immediately, the same way a Countdown's timer elapsing or a Pause's tap does.
The central button is pause/resume for a Countdown (the paused state lives in
`SequenceView` and is passed down to `CountdownView`, and reset whenever the
Step changes) and "continue" for a Pause. Passing the last Step navigates back
to the home screen automatically, with no intermediate "sequence complete"
screen.

The playback screen is exactly one viewport tall and never scrolls (`Page`'s
`fullscreen` mode; only viewports shorter than 600px fall back to scrolling),
down to an iPhone SE's 375x667. To make that hold, the "À suivre" card has a
fixed height (its title is clamped to two lines), so the Step area above it
never changes size from one Step to the next.

`CountdownView` shows a circular progress ring around an mm:ss clock, which
freezes the ring and blinks while paused. The Step area is a size container
laid out as a `1fr / ring / 1fr` grid: the title is centered in the top row (between the
progress bar and the ring) and the ring sits in the middle row, so the ring never
moves whatever the title's length.
The ring is centered on the *screen*, not just on the Step area: since more
chrome sits below the Step area than above it, `SequenceView` exposes the
difference as `--stage-bias`, and the area is stretched down by that amount
(negative bottom margin, behind the controls) so its center is the screen's
center. The ring's diameter is the smallest of 280px, the area's width, and
what fits between the screen's center and the controls, so it shrinks on short
screens. Its timer is driven by comparing `Date.now()` against a recorded start time on
every `requestAnimationFrame` tick, rather than counting `setTimeout` firings —
this keeps it accurate (no drift, no stalling) even if the tab is throttled in
the background, at the cost of only updating when a frame is actually painted.
`PauseView` fills the available space as its tap target — tapping anywhere
advances, the same as the central "continue" button.

`SequenceView` also holds a screen wake lock for as long as it's mounted, via
[useWakeLock.ts](../src/domains/sequence/useWakeLock.ts): it requests one on
mount and re-requests on `visibilitychange` (the OS releases any wake lock
the moment a tab goes hidden, so it doesn't survive being backgrounded on its
own), and releases it on unmount. Acquisition failures (unsupported browser,
non-visible document, low battery mode, etc.) are swallowed silently —
playback works the same either way, it just risks the screen sleeping.

Every time a Step ends — a Countdown elapsing, a Pause tap, or Next —
`SequenceView`'s `goToNext` plays a short synthesized beep via
[playStepEndSound.ts](../src/domains/sequence/playStepEndSound.ts) (a plain
Web Audio oscillator, no audio asset to ship), unless the `soundMuted`
setting (see Data & Settings below) is on.

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
its contents (`setSequences`) — there is no merge option; **Reset** confirms,
then restores `initialSequences` (`resetSequences`, deep-cloned so the
fixtures object itself is never mutated across resets).

A separate `settings` slice
([settingsSlice.ts](../src/data/settings/settingsSlice.ts)), persisted the
same way via [localStorageSettings.ts](../src/data/localStorageSettings.ts),
holds the one `soundMuted` flag. The "Jouer les sons" switch shows it inverted
(on = sounds play), and its speaker icon follows the state: a speaker when
sounds are on, a crossed-out one when muted. The flag itself stays `soundMuted`
so values already persisted on devices keep working.

The Settings page is organised as titled groups of white cards, each row a
round icon plus a label: a "Sons" group (the mute switch), a "Données" group
(Export, Import) and, on its own, a Reset row in the action color. Rows are
plain buttons (or, for the switch, a label), so they stack uniformly.

### Not done

- **Skip a Loop entirely** (per [vision.md](vision.md)) — since Loops are
  flattened before playback starts, the player has no notion of "the current
  loop" to skip past; Next only ever advances one Step at a time.
