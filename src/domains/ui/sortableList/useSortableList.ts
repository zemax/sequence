import {
  CSSProperties,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import classNames from "classnames";

import styles from "./SortableList.module.scss";

const MAX_TILT = 10;
const TILT_FACTOR = 1.2;
const TILT_LERP = 0.25;
const REORDER_TRANSITION_MS = 250;
const DRAG_ACTIVATION_PX = 20;

export type SortableEdge = "left" | "right";

// What an edge action decided: `true` — the item is gone, nothing left to animate; `false` —
// declined; "hold" — the item stays exactly where it was dropped (offset, tilt, delete feedback)
// until the list's `holdId` option stops naming it, then it settles back (or is simply gone).
export type EdgeActionResult = boolean | "hold";

type DragState = {
  id: string;
  startX: number;
  startY: number;
  slotHeight: number;
  originalIndex: number;
  dropIndex: number;
  offsetX: number;
  offsetY: number;
  tilt: number;
  edgeAction: SortableEdge | null;
  hoveredTargetId: string | null;
  escapedContainer: boolean;
};

type HeldItem = {
  id: string;
  offsetX: number;
  offsetY: number;
  tilt: number;
  edge: SortableEdge;
};

type PendingCardSettle = {
  id: string;
  offsetX: number;
  tilt: number;
};

type PendingPress = {
  id: string;
  index: number;
  row: HTMLLIElement;
  startX: number;
  startY: number;
};

export type SortableRowProps = {
  ref: (el: HTMLLIElement | null) => void;
  className: string;
  style: CSSProperties | undefined;
};

export type SortableItemProps = {
  ref: (el: HTMLDivElement | null) => void;
  className: string;
  style: CSSProperties | undefined;
  onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onContextMenu: (e: ReactMouseEvent) => void;
};

export type SortableListOptions<T> = {
  paddingX?: number;
  paddingY?: number;
  edgeActionThreshold?: number;
  onEdgeAction?: (id: string, edge: SortableEdge) => EdgeActionResult;
  // The id of the item a "hold" edge action is waiting on (e.g. while a confirmation is open).
  holdId?: string | null;
  // Lets other rows in the same list act as drop targets — e.g. dragging a Step onto a Loop
  // row nests it there instead of just reordering. Checked after edgeAction, before a normal
  // reorder. See docs/drag-reorder.md.
  isDropTarget?: (item: T) => boolean;
  onDropInto?: (draggedId: string, targetId: string) => boolean;
  // Lets this list detect the dragged item leaving some ancestor container's bounds (not the
  // list's own bounds) — e.g. a Loop's own nested list uses this to eject a Step dragged out
  // past the Loop's envelope. Checked after edgeAction, before a normal reorder.
  containerRef?: RefObject<Element | null>;
  onEscapeContainer?: (id: string) => boolean;
};

export type SortableEntry = {
  isDragging: boolean;
  isHovered: boolean;
  showDropIndicatorBefore: boolean;
  edgeAction: SortableEdge | null;
  rowProps: SortableRowProps;
  itemProps: SortableItemProps;
};

// Press-and-drag reorderable list — see docs/drag-reorder.md.
export const useSortableList = <T,>(
  items: T[],
  getId: (item: T) => string,
  onReorder: (id: string, toIndex: number) => void,
  {
    paddingX = 0,
    paddingY = 0,
    edgeActionThreshold,
    onEdgeAction,
    holdId = null,
    isDropTarget,
    onDropInto,
    containerRef,
    onEscapeContainer,
  }: SortableListOptions<T> = {},
) => {
  const [dragId, setDragId] = useState<string | null>(null);
  const [elevatedId, setElevatedId] = useState<string | null>(null);
  const [dragOriginalIndex, setDragOriginalIndex] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState(0);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [edgeAction, setEdgeAction] = useState<SortableEdge | null>(null);
  const [hoveredTargetId, setHoveredTargetId] = useState<string | null>(null);
  const [held, setHeld] = useState<HeldItem | null>(null);

  const dragState = useRef<DragState | null>(null);
  const elevationTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const pendingPress = useRef<PendingPress | null>(null);

  // Tilt is sampled via rAF and lerped, not driven directly by pointermove deltas (too noisy).
  const rafId = useRef<number | null>(null);
  const pointerX = useRef(0);
  const frameX = useRef(0);
  const currentTilt = useRef(0);

  const rowRefs = useRef(new Map<string, HTMLLIElement>());
  const itemRefs = useRef(new Map<string, HTMLDivElement>());
  const rowPositions = useRef(new Map<string, number>());
  const pendingCardSettle = useRef<PendingCardSettle | null>(null);

  const animateTransform = (el: HTMLElement, fromTransform: string) => {
    el.style.transition = "none";
    el.style.transform = fromTransform;
    el.getBoundingClientRect(); // force the browser to commit the starting transform first
    el.style.transition = `transform ${REORDER_TRANSITION_MS}ms ease`;
    el.style.transform = "";
  };

  const scheduleElevationClear = () => {
    clearTimeout(elevationTimeout.current);
    elevationTimeout.current = setTimeout(() => setElevatedId(null), REORDER_TRANSITION_MS);
  };

  // FLIP. pendingCardSettle is deferred here, after React moves the DOM node on reorder,
  // instead of applied immediately on drop — doing it before the move cuts it short.
  useLayoutEffect(() => {
    rowRefs.current.forEach((row, id) => {
      const newTop = row.getBoundingClientRect().top;
      const pending = pendingCardSettle.current;

      if (pending && pending.id === id) {
        const previousTop = rowPositions.current.get(id) ?? newTop;
        const item = itemRefs.current.get(id);

        animateTransform(row, `translate(${pending.offsetX}px, ${previousTop - newTop}px)`);
        if (item) {
          animateTransform(item, `rotate(${pending.tilt}deg)`);
        }
        scheduleElevationClear();

        pendingCardSettle.current = null;
        rowPositions.current.set(id, newTop);
        return;
      }

      const previousTop = rowPositions.current.get(id);
      if (previousTop !== undefined && previousTop !== newTop) {
        animateTransform(row, `translateY(${previousTop - newTop}px)`);
      }

      rowPositions.current.set(id, newTop);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const settleDraggedItemInPlace = (id: string, offsetX: number, offsetY: number, itemTilt: number) => {
    const row = rowRefs.current.get(id);
    const item = itemRefs.current.get(id);
    if (!row || !item) {
      return;
    }

    animateTransform(row, `translate(${offsetX}px, ${offsetY}px)`);
    animateTransform(item, `rotate(${itemTilt}deg)`);
    scheduleElevationClear();
  };

  // A held item goes back to its slot as soon as nothing is waiting on it any more (a cancelled
  // confirmation). If it was removed meanwhile there is no row left and this only clears state.
  useLayoutEffect(() => {
    if (held && holdId !== held.id) {
      settleDraggedItemInPlace(held.id, held.offsetX, held.offsetY, held.tilt);
      scheduleElevationClear();
      setHeld(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [held, holdId]);

  const tiltTick = () => {
    const drag = dragState.current;
    if (!drag) {
      rafId.current = null;
      return;
    }

    const frameDeltaX = pointerX.current - frameX.current;
    frameX.current = pointerX.current;
    const targetTilt = Math.max(-MAX_TILT, Math.min(MAX_TILT, frameDeltaX * TILT_FACTOR));
    currentTilt.current += (targetTilt - currentTilt.current) * TILT_LERP;
    drag.tilt = currentTilt.current;
    setTilt(currentTilt.current);

    rafId.current = requestAnimationFrame(tiltTick);
  };

  const endDrag = () => {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerCancel);
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }

    dragState.current = null;
    setDragId(null);
    setDragOriginalIndex(null);
    setDragOffset({ x: 0, y: 0 });
    setTilt(0);
    setDropIndex(null);
    setEdgeAction(null);
    setHoveredTargetId(null);
  };

  const onPointerMove = (e: PointerEvent) => {
    const drag = dragState.current;
    if (!drag) {
      return;
    }

    drag.offsetX = e.clientX - drag.startX;
    drag.offsetY = e.clientY - drag.startY;
    setDragOffset({ x: drag.offsetX, y: drag.offsetY });
    pointerX.current = e.clientX;

    const slotOffset = Math.round((e.clientY - drag.startY) / drag.slotHeight);
    const nextDropIndex = Math.max(0, Math.min(items.length - 1, drag.originalIndex + slotOffset));
    drag.dropIndex = nextDropIndex;
    setDropIndex(nextDropIndex);

    const nextEdgeAction =
      edgeActionThreshold === undefined
        ? null
        : e.clientX < edgeActionThreshold
          ? "left"
          : window.innerWidth - e.clientX < edgeActionThreshold
            ? "right"
            : null;
    drag.edgeAction = nextEdgeAction;
    setEdgeAction(nextEdgeAction);

    if (isDropTarget) {
      let nextHoveredId: string | null = null;
      for (const [otherId, otherRow] of rowRefs.current.entries()) {
        if (otherId === drag.id) {
          continue;
        }
        const otherItem = items.find((item) => getId(item) === otherId);
        if (!otherItem || !isDropTarget(otherItem)) {
          continue;
        }
        const rect = otherRow.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
          nextHoveredId = otherId;
          break;
        }
      }
      drag.hoveredTargetId = nextHoveredId;
      setHoveredTargetId(nextHoveredId);
    }

    if (containerRef) {
      const containerRect = containerRef.current?.getBoundingClientRect();
      drag.escapedContainer = containerRect
        ? e.clientX < containerRect.left || e.clientX > containerRect.right || e.clientY < containerRect.top || e.clientY > containerRect.bottom
        : false;
    }
  };

  const onPointerUp = () => {
    const drag = dragState.current;
    if (drag) {
      // Each of these, if it applies, is presumed to fully own the item's fate (moved
      // elsewhere or removed) — nothing left to animate here, unlike reorder/settle below.
      const edgeResult = drag.edgeAction !== null ? (onEdgeAction?.(drag.id, drag.edgeAction) ?? false) : false;
      if (edgeResult === "hold" && drag.edgeAction !== null) {
        setHeld({ id: drag.id, offsetX: drag.offsetX, offsetY: drag.offsetY, tilt: drag.tilt, edge: drag.edgeAction });
      }

      const handled =
        edgeResult !== false ||
        (drag.hoveredTargetId !== null && (onDropInto?.(drag.id, drag.hoveredTargetId) ?? false)) ||
        (drag.escapedContainer && (onEscapeContainer?.(drag.id) ?? false));

      if (!handled) {
        if (drag.dropIndex !== drag.originalIndex) {
          const row = rowRefs.current.get(drag.id);
          if (row) {
            rowPositions.current.set(drag.id, row.getBoundingClientRect().top);
          }
          pendingCardSettle.current = { id: drag.id, offsetX: drag.offsetX, tilt: drag.tilt };
          onReorder(drag.id, drag.dropIndex);
        } else {
          settleDraggedItemInPlace(drag.id, drag.offsetX, drag.offsetY, drag.tilt);
        }
      }
    }
    endDrag();
  };

  const onPointerCancel = () => {
    const drag = dragState.current;
    if (drag) {
      settleDraggedItemInPlace(drag.id, drag.offsetX, drag.offsetY, drag.tilt);
    }
    endDrag();
  };

  // Prevents the "click" that follows pointerup from falling through to a link underneath.
  const suppressNextClick = () => {
    const handler = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      window.removeEventListener("click", handler, true);
    };
    window.addEventListener("click", handler, true);
  };

  const startDrag = (row: HTMLLIElement, id: string, index: number, startX: number, startY: number) => {
    suppressNextClick();
    navigator.vibrate?.(15);
    const item = itemRefs.current.get(id);
    row.style.transition = "none";
    if (item) {
      item.style.transition = "none";
    }
    const rect = row.getBoundingClientRect();
    const marginBottom = parseFloat(getComputedStyle(row).marginBottom || "0");

    dragState.current = {
      id,
      startX,
      startY,
      slotHeight: rect.height + marginBottom,
      originalIndex: index,
      dropIndex: index,
      offsetX: 0,
      offsetY: 0,
      tilt: 0,
      edgeAction: null,
      hoveredTargetId: null,
      escapedContainer: false,
    };

    pointerX.current = startX;
    frameX.current = startX;
    currentTilt.current = 0;

    clearTimeout(elevationTimeout.current);
    setDragId(id);
    setElevatedId(id);
    setDragOriginalIndex(index);
    setDragOffset({ x: 0, y: 0 });
    setTilt(0);
    setDropIndex(index);

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerCancel);
    rafId.current = requestAnimationFrame(tiltTick);
  };

  const cancelPendingPress = () => {
    pendingPress.current = null;
    window.removeEventListener("pointermove", onPendingPointerMove);
    window.removeEventListener("pointerup", onPendingPointerUp);
    window.removeEventListener("pointercancel", onPendingPointerUp);
  };

  const onPendingPointerMove = (e: PointerEvent) => {
    const pending = pendingPress.current;
    if (!pending) {
      return;
    }
    const dx = e.clientX - pending.startX;
    const dy = e.clientY - pending.startY;
    if (Math.hypot(dx, dy) > DRAG_ACTIVATION_PX) {
      cancelPendingPress();
      startDrag(pending.row, pending.id, pending.index, pending.startX, pending.startY);
      onPointerMove(e);
    }
  };

  const onPendingPointerUp = () => {
    cancelPendingPress();
  };

  const handlePointerDown = (id: string, index: number, e: ReactPointerEvent<HTMLDivElement>) => {
    // A nested SortableList (e.g. a Loop's own steps inside the Sequence's list) sits inside
    // this list's item div — without this, a pointerdown on a nested row would also reach this
    // (outer) list's handler and arm two drags from a single press.
    e.stopPropagation();

    const row = rowRefs.current.get(id);
    if (!row) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
    if (localX < paddingX || localX > rect.width - paddingX || localY < paddingY || localY > rect.height - paddingY) {
      return;
    }

    cancelPendingPress();
    pendingPress.current = { id, index, row, startX: e.clientX, startY: e.clientY };

    window.addEventListener("pointermove", onPendingPointerMove);
    window.addEventListener("pointerup", onPendingPointerUp);
    window.addEventListener("pointercancel", onPendingPointerUp);
  };

  // onReorder removes then re-inserts, so a forward move shifts the visual anchor by one.
  const indicatorIndex =
    dragId !== null && dropIndex !== null && dragOriginalIndex !== null && dropIndex !== dragOriginalIndex
      ? dropIndex >= dragOriginalIndex
        ? dropIndex + 1
        : dropIndex
      : null;

  const getItemProps = (item: T, index: number): SortableEntry => {
    const id = getId(item);
    const isDragging = id === dragId;
    const isHeld = held?.id === id;
    const isElevated = id === elevatedId;

    return {
      // A held item keeps looking dragged — same lift, offset, tilt and delete feedback.
      isDragging: isDragging || isHeld,
      isHovered: !isDragging && !isHeld && id === hoveredTargetId,
      showDropIndicatorBefore: indicatorIndex === index,
      edgeAction: isDragging ? edgeAction : isHeld ? held.edge : null,
      rowProps: {
        ref: (el) => {
          if (el) {
            rowRefs.current.set(id, el);
          } else {
            rowRefs.current.delete(id);
          }
        },
        className: classNames(styles.row, isElevated && styles.rowElevated),
        style: isDragging
          ? { transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)` }
          : isHeld
            ? { transform: `translate(${held.offsetX}px, ${held.offsetY}px)` }
            : undefined,
      },
      itemProps: {
        ref: (el) => {
          if (el) {
            itemRefs.current.set(id, el);
          } else {
            itemRefs.current.delete(id);
          }
        },
        className: styles.item,
        style: isDragging ? { transform: `rotate(${tilt}deg)` } : isHeld ? { transform: `rotate(${held.tilt}deg)` } : undefined,
        onPointerDown: (e) => handlePointerDown(id, index, e),
        onContextMenu: (e) => e.preventDefault(),
      },
    };
  };

  return {
    getItemProps,
    showTrailingDropIndicator: indicatorIndex === items.length,
  };
};
