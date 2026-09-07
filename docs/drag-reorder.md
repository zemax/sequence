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
  now would actually change the order.
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

## Edge actions: dragging to the side of the viewport

Besides reordering, a drag can also trigger a one-off action by carrying the
item to the edge of the *viewport* (not the list) — e.g. dragging far enough
right to delete it, the way [SequenceList](../src/domains/sequence/SequenceList.tsx)
does. This is opt-in via `edgeActionThreshold` (a pixel distance from
`window`'s left/right edge) and `onEdgeAction(id, edge)`, both left unset by
default (the feature is entirely inert unless both are supplied).

While dragging, every `pointermove` compares the pointer's `clientX` against
`window.innerWidth`; crossing into either margin sets `entry.edgeAction` to
`"left"` or `"right"` (`null` otherwise, and always `null` while not
dragging) so the item being dragged can render whatever feedback makes sense
(SequenceList overlays a trash icon — see [SequenceList.tsx](../src/domains/sequence/SequenceList.tsx)).

`onEdgeAction` **returns a `boolean`**: `true` means it acted on this edge
(the item is presumed to be leaving the list, e.g. deleted) and skips the
normal reorder/settle logic entirely — there's nothing left to animate back
into place. `false` means it declined (wrong edge, or this list doesn't
support an action there), and release falls through to the usual
reorder-or-settle behavior exactly as if `edgeAction` had never been set.
This is why SequenceList's handler returns `false` for `"left"`: it only
deletes on `"right"`, so releasing on the left settles the item back in
place like a normal aborted drag, instead of leaving it stranded.

## Using it elsewhere

```tsx
<SortableList
  items={items} // T[]
  getId={(item) => item.id} // stable id per item
  onReorder={(id, toIndex) => dispatchYourReorderAction(id, toIndex)}
  paddingX={8} // optional; both default to 0 — see above
  paddingY={8}
  edgeActionThreshold={100} // optional; see "Edge actions" above
  onEdgeAction={(id, edge) => {
    if (edge !== "right") return false; // let "left" settle back normally
    dispatchYourDeleteAction(id);
    return true;
  }}
  className={yourOwnListStyles}
>
  {(item, entry) => (
    <SortableItem key={item.id} entry={entry} className={yourOwnItemStyles} draggingClassName={yourOwnDraggingStyles}>
      {/* your item's content */}
      {entry.edgeAction === "right" && <YourOwnDeleteOverlay />}
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
