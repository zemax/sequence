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
screen and defines its own configurable fields. The first and reference type is:

- **Countdown** — displays its title on screen for a configurable `duration`
  (e.g. seconds), then automatically advances to the next item in the Sequence.

Other Step types (e.g. a manual "tap to continue" step, a message/instruction step,
a rest step) can be added later following the same pattern: a title, one or more
type-specific fields, and a defined on-screen behavior.

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
  elapses), then the next item plays
- a Loop replays its contained Steps in order, `repeatCount` times, before moving on
  to the next item in the parent Sequence

## Current implementation status

As of now, the data model implemented in the codebase
([sequencesSlice.ts](../src/data/sequences/sequencesSlice.ts)) covers a `Sequence`
made of `Step { id, name, duration }` — the Countdown behavior described above,
without a `type` discriminator or Loop support yet. The concepts above describe the
target model this implementation is being built towards.
