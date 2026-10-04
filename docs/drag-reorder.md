# Drag-to-reorder

This describes the reusable drag-and-drop reordering behavior implemented in
[src/domains/ui/sortableList](../src/domains/ui/sortableList), currently used by
[SequenceList](../src/domains/sequence/SequenceList.tsx) to reorder Sequences on
the home screen. It's a plain hook + a couple of small components — no drag/drop
library — built directly on Pointer Events.

## Interaction design

- **Moving past a small threshold picks it up.** Pressing down and moving more
  than ~20px arms the drag immediately (no delay): the item lifts (elevated
  shadow), and a short vibration confirms it (where supported — no-op on iOS
  Safari, which has no Vibration API).
- **Follows the pointer, and leans into it.** The picked-up item translates with
  the pointer and tilts slightly based on horizontal movement speed, easing back
  to flat when movement stops — a "natural" pick-up feel rather than a rigid
  ghost image.
- **A drop indicator shows where it will land**, and only appears when dropping
  now would actually change the order. The position is read from the rows
  themselves — the number of other rows whose middle is above the pointer — not
  from a fixed slot height, because rows can have very different heights (a Loop
  is far taller than a Step).
- **Releasing settles the item smoothly** into its final position — from
  wherever it currently is, not from a snap-back to its original slot — while
  other items slide into their new places (a FLIP animation). Releasing without
  having moved far enough just relaxes back to the original spot.
- **A quick tap still behaves like a tap**: if the pointer is released before
  crossing the threshold, nothing about the underlying content's own click/link
  behavior is affected.

## Why a distance threshold, not immediate drag on pointerdown

Arming the drag on plain `pointerdown`, with zero threshold, would turn every
tap into a pick-up gesture — there'd be no way to tell "tap to open" from "press
to drag" until movement (or its absence) resolves it. The ~20px threshold is
what makes that distinction: released before crossing it, it's a tap and the
underlying link fires normally; crossed, it's a drag. This is a movement
threshold, not a timer — it doesn't need to wait, and doesn't fight scrolling,
because that's handled separately below.

## The touch-action trade-off

Each item has `touch-action: none` **permanently**, not just while it's
actively being dragged. This looks like it should be avoidable — why not
leave scrolling enabled and only disable it once the drag actually arms? —
but it isn't, for a specific reason: **`touch-action` is fixed by the browser
for an entire touch sequence as of its very first contact.** Changing it
later in JS, even synchronously the instant the threshold is crossed, has no
effect on that same in-progress touch — the browser already decided at
`pointerdown` whether this touch is allowed to scroll. If it started as
scrollable, a vertical drag after arming can still lose to native scrolling
mid-gesture.

The consequence: a swipe that starts with a finger placed on an item won't
scroll the page. Swiping from elsewhere (the gaps between rows, or non-row
content) scrolls normally. This was a deliberate choice over the alternative
— reimplementing scrolling (and its momentum) by hand in JS — which was
tried and reverted: it worked, but added real complexity and risk (fighting
the platform) for behavior the browser already provides.

## Protecting part of an item: paddingX / paddingY

`useSortableList`'s 4th argument, `{ paddingX, paddingY }` (both default to
`0`), excludes a margin around each item's edges from arming a drag: a
`pointerdown` landing within that many pixels of the item's border is simply
ignored — no pending press is registered, so it behaves exactly as if the
whole feature were absent there. This is a plain coordinate check against the
item's own `getBoundingClientRect()` in `handlePointerDown`, nothing more —
no separate DOM layer, no effect on `touch-action` (which still applies to
the whole item uniformly — see the trade-off above), and no effect on
clicks: nothing is ever overlaid on the real content, so a click anywhere,
margin included, always reaches whatever is actually there, completely
unaffected by this feature.

What this margin buys, then, isn't native scroll (that would need an actual
touch-action split, which isn't worth the complexity here) — it's protecting
a specific spot in the item from being mistaken for a drag start. This
matters when an item packs its own interactive controls close to an edge
(e.g. a delete button on a Step row): without padding, a slightly-off-target
press on that control could rack up more than 20px of incidental movement
and arm a drag instead of hitting the button.

## Delete zone: dragging to the bottom of the screen

Besides reordering, a drag can delete the item by carrying it into a
"Supprimer" zone that slides in from the bottom of the screen while something is
being dragged, like removing an icon on Android. It is opt-in: passing
`onDelete(id)` to [`SortableList`](../src/domains/ui/sortableList/SortableList.tsx)
makes it render a [`DeleteZone`](../src/domains/ui/sortableList/DeleteZone.tsx)
(through a portal on `document.body`, so ancestors' transforms can't offset its
`position: fixed`) and hand it to the hook as `deleteZoneRef`.

The zone is a floating pill centered above the bottom edge: translucent white with
an action-colored outline at rest, filled with the action color (and slightly
larger) when the item is over it, and drawn below the dragged row (the lifted row
has a higher `z-index`). Every `pointermove` checks whether the pointer is within
the pill's box (`offsetLeft`/`offsetTop`/`offsetWidth`/`offsetHeight`, which ignore
its slide-in transform), widened by 24px so a finger doesn't need to be exact.
Over the zone, the dragged item is dimmed (`overDeleteZone` class), the other
cues (drop indicator, hovered Loop, escape) are suppressed, and a short vibration
confirms it where supported. While anything is dragged, `SortableList` sets
`data-dragging` on `<body>`, which hides the floating buttons (`.floating`) so
they don't sit next to the zone.

`onDelete` **returns a `DeleteResult`**: `true` means the item is gone, so the
normal reorder/settle is skipped; `false` declines and release falls through to
the usual behavior as if the zone had never been reached.

Neither list deletes right away: the handler stores the id and returns `"hold"`,
and a small "Supprimer ?" dialog
([ConfirmDialog](../src/domains/ui/components/ConfirmDialog/ConfirmDialog.tsx):
X cancels, check confirms) decides.

`"hold"` is a third answer next to `true` and `false`: the drag is over and
the list does not reorder, but the item **stays exactly where it was dropped**
(same offset, tilt and lift) instead of resetting. It stays
held for as long as the list's `holdId` option names it — the caller passes
the id it is waiting on (here the pending-delete id). When `holdId` stops
naming the item, the list releases it: if it is still there (the user
cancelled) it settles back to its slot with the usual animation; if it has
been removed (the user confirmed) there is nothing left to animate.

## Nesting: dropping one item onto another, and escaping a container

Beyond plain reordering, two more opt-in behaviors — both used to let a Step be
dragged into or out of a Loop in [StepList](../src/domains/steps/common/StepList.tsx)
— let a `SortableList` interact with something other than its own row order:

- **`isDropTarget` / `onDropInto`** let other rows *in the same list* act as
  drop targets instead of just reorder slots. While dragging, every
  `pointermove` checks the dragged item's position against each other row for
  which `isDropTarget(item)` is `true`; landing inside one sets
  `entry.isHovered` on that row (so it can render hover feedback — see
  [LoopPreview](../src/domains/steps/loop/LoopPreview.tsx)'s highlighted container).
  The hook also reads where in the target the pointer is — the number of the
  target's own rows (the first nested `<ul>`) whose middle is above it — and
  exposes it as `entry.dropIntoIndex`. Releasing there calls
  `onDropInto(draggedId, targetId, index, dropped)`, which — like
  `onDelete` — returns a `boolean`: `true` means it took ownership of the
  item (StepList removes it from the flat list and inserts it in the target
  Loop's `steps` at `index`), skipping the normal reorder/settle entirely;
  `false` falls through to a normal reorder, exactly as if nothing were hovered.
- **`containerRef` / `onEscapeContainer`** let a list detect the dragged item
  leaving some *ancestor* element's bounds — not the list's own bounds, which
  is otherwise unbounded. This is for the reverse direction: a Loop's nested
  `StepList` (the one rendering its `steps`) passes the Loop's own envelope
  `<div>` as `containerRef`; once a drag's pointer crosses outside that
  rect, `escapedContainer` is armed, and releasing calls
  `onEscapeContainer(id, clientY)` — StepList's handler removes the Step from
  the Loop and inserts it into the parent list at the position given by the
  pointer's `clientY` (above, below or between any of the parent's rows, the
  Loop included), computed the same way as a normal drop position. Same
  `boolean` contract as the other two: `false` means decline and fall
  through to a normal reorder/settle.

While dragging, each of these shows where the item will land, and only one
cue is shown at a time. Hovering a drop target (`entry.isHovered`) makes
[LoopPreview](../src/domains/steps/loop/LoopPreview.tsx) highlight the Loop and
pass `entry.dropIntoIndex` to its nested list as `externalDropIndex`, so the
regular drop indicator shows where the Step will land inside the Loop (also in an
empty one), and the outer list hides its own reorder indicator. The dropped row
then slides from where it was released to its slot, like a Step leaving a Loop.
Escaping a container is reported through `onEscapePointer(clientY | null)` on
every move outside it: the Loop's border turns orange (solid, like when a Step is dropped into it), the nested list hides its
own reorder indicator, and the parent list shows its regular drop indicator at
the landing position (`externalDropIndex`) until the pointer comes back inside.

Both checks run in `onPointerUp` alongside `onDelete`, in the order
delete zone → drop-into → escape-container → plain reorder — the first one
that returns `true` wins, and none of them fire while not dragging.

When rows move after a drop (reorder, a Step entering or leaving a Loop), they
slide from their previous position. Two details keep that start position right:

- It is the position of the row's visible block, not of its `<li>`: the drop
  indicator lives inside the `<li>`, above the block, so using the `<li>` made a
  row that had just been the drop target start 12px too high.
- It is measured relative to the list itself, not to the page. When a Step
  leaves a Loop and lands above it, the whole Loop moves down; a nested list
  measuring against the page would see its rows move too and compensate for it a
  second time, on top of the Loop's own slide, so its remaining Steps would start
  far too high.

A Step released outside its Loop is a new row in the parent list, so it would
appear instantly in its final slot while the Loop, still at its previous
position, slides down underneath it. Instead the nested list hands the parent
where the row was released (`DroppedGeometry`, through `incomingRef`), and the
parent slides the new row from there to its slot, lifted above the other rows,
like a normal reorder. The slide is computed once every layout effect has run
(an ancestor such as the Loop applies its own slide in the same commit), and the
rows are aligned by their centers, since the same card is narrower inside a Loop.

A Loop also animates its own height when a Step is added to or removed from it,
so the rows below it don't jump. The "Ajouter" row under the list is not a
sortable row, so `StepList` slides it the same way when the list changes: it
reads where the row is during render (before React updates the DOM) and eases it
from there.

One consequence of nesting a `SortableList` inside another list's item (a
Loop's body sits inside the outer list's `<li>`): a `pointerdown` on a row of
the *inner* list would otherwise bubble up and arm a drag on the *outer* list
too. `handlePointerDown` calls `e.stopPropagation()` for exactly this reason
— without it, dragging a Step inside a Loop would simultaneously try to drag
the Loop itself.

## Using it elsewhere

```tsx
<SortableList
  items={items} // T[]
  getId={(item) => item.id} // stable id per item
  onReorder={(id, toIndex) => dispatchYourReorderAction(id, toIndex)}
  paddingX={8} // optional; both default to 0 — see above
  paddingY={8}
  onDelete={(id) => {
    // optional; shows the delete zone while dragging — see "Delete zone" above
    dispatchYourDeleteAction(id);
    return true;
  }}
  className={yourOwnListStyles}
>
  {(item, entry) => (
    <SortableItem key={item.id} entry={entry} className={yourOwnItemStyles} draggingClassName={yourOwnDraggingStyles}>
      {/* your item's content */}
    </SortableItem>
  )}
</SortableList>
```

- [`SortableList`](../src/domains/ui/sortableList/SortableList.tsx) renders
  the `<ul>` and the trailing drop indicator; its `children` is a render
  function called once per item with `(item, entry)`, where `entry` is what
  you'd get from `useSortableList().getItemProps(item, index)` directly if
  you needed lower-level control.
- [`SortableItem`](../src/domains/ui/sortableList/SortableItem.tsx) renders
  one `<li>`, its leading [`SortableDropIndicator`](../src/domains/ui/sortableList/SortableDropIndicator.tsx),
  and the actual item `<div>` wrapping your content. `className` is your
  item's resting style; `draggingClassName` is applied alongside it — not
  instead of it — while dragging. It deliberately does **not** include a
  "lifted" shadow itself: that has to know your item's resting shadow to
  look right, and a value your own stylesheet sets can otherwise be
  overridden unpredictably by this module's stylesheet depending on bundle
  order. Put `draggingClassName` in the same stylesheet as your resting
  style, right after it in the same `classNames(...)` position this module
  builds internally.
- Any link rendered inside a sortable item should use
  [`NoDragLink`](../src/domains/ui/sortableList/NoDragLink.tsx) instead of
  React Router's `Link` directly — Firefox starts its own native link-drag on a
  mousedown-and-move over a plain `<a>`, which otherwise hijacks the gesture
  before this hook ever sees it.
- Need something `SortableList`/`SortableItem` don't offer (a different root
  element than `<ul>`/`<li>`, custom placement of the drop indicator)? Call
  [`useSortableList`](../src/domains/ui/sortableList/useSortableList.ts)
  directly — both components are thin wrappers around it.
