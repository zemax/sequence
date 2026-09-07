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
Sequence's `name`, add Countdown or Pause Steps, edit an existing Step in place
(tapping a `<Type>Preview` swaps it for its `<Type>PreviewEdit`), delete a Step by
dragging it to the screen edge, and reorder Steps by dragging — all via the same
[SortableList](../src/domains/ui/sortableList) used for Sequences on the home
screen (see [drag-reorder.md](drag-reorder.md)).

On the home screen, [SequenceList.tsx](../src/domains/sequence/SequenceList.tsx)
supports the same drag-and-drop reordering for Sequences themselves.

### Authoring — not done

**Loops cannot be created or edited.** The `Loop` type is fully modeled and
handled correctly wherever it's read (see Playback below), but there is no UI
path to produce one — `SequenceForm`'s "add step" row only offers Countdown and
Pause, and a `Loop` item, if one existed, would render as an inert `"Loop x{n}"`
string in the item list rather than an editable row.

### Playback — done

[SequenceView.tsx](../src/domains/sequence/SequenceView.tsx) is the full-screen
player, routed at `/sequence/view/:id`. It flattens a Sequence's `items` into a
single ordered list of Steps up front — a `Loop` expands into its contained
Steps repeated `repeatCount` times, so the player itself never needs to know
about Loops as a distinct concept during playback — and walks through that list
one `StepView` at a time.

Alongside the current Step, three floating controls are always present:
**Back** (bottom-left, exits to the home screen), and **Previous**/**Next**
(bottom-right; Previous is hidden on the first Step). Next doubles as the
"skip" affordance described in [vision.md](vision.md) — it forces the current
Step to end immediately, the same way a Countdown's timer elapsing or a
Pause's tap does. Passing the last Step navigates back to the home screen
automatically, with no intermediate "sequence complete" screen.

`CountdownView` shows a circular progress ring around an mm:ss clock, and a
pause/resume button that freezes the ring and blinks the clock while paused.
Its timer is driven by comparing `Date.now()` against a recorded start time on
every `requestAnimationFrame` tick, rather than counting `setTimeout` firings —
this keeps it accurate (no drift, no stalling) even if the tab is throttled in
the background, at the cost of only updating when a frame is actually painted.
`PauseView` fills the full screen as its tap target and shows a "next" icon to
hint that tapping advances.

### Not done

- **Skip a Loop entirely** (per [vision.md](vision.md)) — since Loops are
  flattened before playback starts, the player has no notion of "the current
  loop" to skip past; Next only ever advances one Step at a time. Revisit once
  Loops can actually be authored.
- **Export/Import as JSON** — not started.
