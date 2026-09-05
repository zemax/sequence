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

The authoring UI ([Form.tsx](../src/domains/sequence/Form.tsx)) lets a user edit a
Sequence's `name` and add or remove Countdown or Pause Steps, using `StepEdit`/
`StepPreview` from [src/domains/steps](../src/domains/steps).

Each Step type's `View` component is implemented and self-contained (Countdown
counts down and calls `onDone`; Pause waits for a tap), but nothing wires them
together yet: editing an existing Step in place, reordering Steps, creating or
editing Loops, and the Sequence-level playback screen
([View.tsx](../src/domains/sequence/View.tsx)) that would walk through a
Sequence's items and render each Step's `View` are not implemented yet.
