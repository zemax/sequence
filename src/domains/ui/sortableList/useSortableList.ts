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

import { REORDER_TRANSITION_MS, animateTransform } from "./animateTransform";
import { layoutTop } from "./layoutTop";

import styles from "./SortableList.module.scss";

const MAX_TILT = 10;
const TILT_FACTOR = 1.2;
const TILT_LERP = 0.25;
const DRAG_ACTIVATION_PX = 20;
const DELETE_ZONE_REACH = 24;

export type DroppedGeometry = { top: number; left: number; width: number; tilt: number };
export type IncomingRow = DroppedGeometry & { id: string };

type HoveredTarget = { id: string; index: number };

// "hold": the item stays where it was dropped until the `holdId` option stops naming it.
export type DeleteResult = boolean | "hold";

type DragState = {
  id: string;
  startX: number;
  startY: number;
  lastY: number;
  originalIndex: number;
  dropIndex: number;
  offsetX: number;
  offsetY: number;
  tilt: number;
  overDeleteZone: boolean;
  hovered: HoveredTarget | null;
  escapedContainer: boolean;
};

type HeldItem = {
  id: string;
  offsetX: number;
  offsetY: number;
  tilt: number;
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
  deleteZoneRef?: RefObject<HTMLElement | null>;
  onDelete?: (id: string) => DeleteResult;
  holdId?: string | null;
  // Lets other rows in the same list act as drop targets — e.g. dragging a Step onto a Loop
  // row nests it there instead of just reordering. Checked after the delete zone, before a normal
  // reorder. See docs/drag-reorder.md.
  isDropTarget?: (item: T) => boolean;
  onDropInto?: (draggedId: string, targetId: string, index: number, dropped: DroppedGeometry) => boolean;
  // Lets this list detect the dragged item leaving some ancestor container's bounds (not the
  // list's own bounds) — e.g. a Loop's own nested list uses this to eject a Step dragged out
  // past the Loop's envelope. Checked after the delete zone, before a normal reorder.
  containerRef?: RefObject<Element | null>;
  onEscapeContainer?: (id: string, clientY: number, dropped: DroppedGeometry) => boolean;
  incomingRef?: RefObject<IncomingRow | null>;
  onEscapePointer?: (clientY: number | null) => void;
  externalDropIndex?: number | null;
};

export type SortableEntry = {
  isDragging: boolean;
  isHovered: boolean;
  dropIntoIndex: number | null;
  showDropIndicatorBefore: boolean;
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
    deleteZoneRef,
    onDelete,
    holdId = null,
    isDropTarget,
    onDropInto,
    containerRef,
    onEscapeContainer,
    onEscapePointer,
    externalDropIndex = null,
    incomingRef,
  }: SortableListOptions<T> = {},
) => {
  const [dragId, setDragId] = useState<string | null>(null);
  const [elevatedId, setElevatedId] = useState<string | null>(null);
  const [dragOriginalIndex, setDragOriginalIndex] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState(0);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [overDeleteZone, setOverDeleteZone] = useState(false);
  const [hovered, setHovered] = useState<HoveredTarget | null>(null);
  const [held, setHeld] = useState<HeldItem | null>(null);
  const [escaped, setEscaped] = useState(false);

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

  // Relative to the list: a nested list must not see its parent move, or it compensates it twice.
  // Measured on the visible block, not the <li>: the drop indicator sits inside the <li>.
  const listTop = (row: HTMLElement) => layoutTop(row.parentElement as HTMLElement);
  const blockTop = (id: string, row: HTMLElement) => layoutTop(itemRefs.current.get(id) ?? row) - listTop(row);
  const visualTop = (row: HTMLElement) => row.getBoundingClientRect().top + window.scrollY - listTop(row);

  const scheduleElevationClear = () => {
    clearTimeout(elevationTimeout.current);
    elevationTimeout.current = setTimeout(() => setElevatedId(null), REORDER_TRANSITION_MS);
  };

  // FLIP. pendingCardSettle is deferred here, after React moves the DOM node on reorder,
  // instead of applied immediately on drop — doing it before the move cuts it short.
  useLayoutEffect(() => {
    rowRefs.current.forEach((row, id) => {
      const newTop = blockTop(id, row);
      const pending = pendingCardSettle.current;
      const incoming = incomingRef?.current;

      if (incoming && incoming.id === id) {
        // Deferred: ancestors' own slide (a Loop moving) is only applied once every layout effect has run.
        queueMicrotask(() => {
          const rect = row.getBoundingClientRect();
          const dx = incoming.left + incoming.width / 2 - (rect.left + rect.width / 2);
          animateTransform(row, `translate(${dx}px, ${incoming.top - rect.top}px)`);
          const item = itemRefs.current.get(id);
          if (item) {
            animateTransform(item, `rotate(${incoming.tilt}deg)`);
          }
          setElevatedId(id);
          scheduleElevationClear();
        });

        (incomingRef as { current: IncomingRow | null }).current = null;
        rowPositions.current.set(id, newTop);
        return;
      }

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

  // A row can resize without this list rendering (a Loop's nested list expanding a Step):
  // re-record positions whenever any row resizes, or the FLIP compares against stale ones.
  const resizeObserver = useRef<ResizeObserver | null>(null);
  const observedRows = useRef(new WeakSet<HTMLElement>());

  const recordRowPositions = () => {
    rowRefs.current.forEach((row, id) => {
      rowPositions.current.set(id, blockTop(id, row));
    });
  };

  const observeRow = (row: HTMLElement) => {
    if (typeof ResizeObserver === "undefined" || observedRows.current.has(row)) {
      return;
    }
    resizeObserver.current ??= new ResizeObserver(recordRowPositions);
    resizeObserver.current.observe(row);
    observedRows.current.add(row);
  };

  // Re-observes mounted rows: dev's double-invoked effects disconnect without re-running refs.
  useLayoutEffect(() => {
    rowRefs.current.forEach(observeRow);

    return () => {
      resizeObserver.current?.disconnect();
      resizeObserver.current = null;
      observedRows.current = new WeakSet();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recorded after every render: a layout shift that isn't a reorder (a row expanding into its
  // edit form) would otherwise be mistaken for a move on the next edit.
  useLayoutEffect(recordRowPositions);

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

  // Release a held item once nothing waits on it: it settles back, or is already gone.
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
    suppressNextClick();
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerCancel);
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }

    if (dragState.current?.escapedContainer) {
      onEscapePointer?.(null);
    }
    setEscaped(false);
    dragState.current = null;
    setDragId(null);
    setDragOriginalIndex(null);
    setDragOffset({ x: 0, y: 0 });
    setTilt(0);
    setDropIndex(null);
    setOverDeleteZone(false);
    setHovered(null);
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

    drag.lastY = e.clientY;

    // Read from the rows: they have different heights (a Loop is far taller than a Step).
    let nextDropIndex = 0;
    for (const item of items) {
      const otherId = getId(item);
      const rect = otherId !== drag.id ? rowRefs.current.get(otherId)?.getBoundingClientRect() : undefined;
      if (rect && e.clientY > rect.top + rect.height / 2) {
        nextDropIndex++;
      }
    }
    drag.dropIndex = nextDropIndex;
    setDropIndex(nextDropIndex);

    const zone = deleteZoneRef?.current;
    const nowOverDeleteZone =
      !!zone &&
      e.clientX > zone.offsetLeft - DELETE_ZONE_REACH &&
      e.clientX < zone.offsetLeft + zone.offsetWidth + DELETE_ZONE_REACH &&
      e.clientY > zone.offsetTop - DELETE_ZONE_REACH &&
      e.clientY < zone.offsetTop + zone.offsetHeight + DELETE_ZONE_REACH;
    if (nowOverDeleteZone && !drag.overDeleteZone) {
      navigator.vibrate?.(10);
    }
    drag.overDeleteZone = nowOverDeleteZone;
    setOverDeleteZone(nowOverDeleteZone);

    if (isDropTarget) {
      let nextHovered: HoveredTarget | null = null;
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
          const nestedRows = [...(otherRow.querySelector("ul")?.children ?? [])].slice(0, -1);
          const index = nestedRows.filter((nested) => {
            const nestedRect = nested.getBoundingClientRect();
            return e.clientY > nestedRect.top + nestedRect.height / 2;
          }).length;
          nextHovered = { id: otherId, index };
          break;
        }
      }
      if (nowOverDeleteZone) {
        nextHovered = null;
      }
      drag.hovered = nextHovered;
      setHovered((current) => (current?.id === nextHovered?.id && current?.index === nextHovered?.index ? current : nextHovered));
    }

    if (containerRef) {
      const containerRect = containerRef.current?.getBoundingClientRect();
      const nowEscaped = containerRect && !nowOverDeleteZone
        ? e.clientX < containerRect.left || e.clientX > containerRect.right || e.clientY < containerRect.top || e.clientY > containerRect.bottom
        : false;
      if (nowEscaped) {
        onEscapePointer?.(e.clientY);
      } else if (drag.escapedContainer) {
        onEscapePointer?.(null);
      }
      if (nowEscaped !== drag.escapedContainer) {
        setEscaped(nowEscaped);
      }
      drag.escapedContainer = nowEscaped;
    }
  };

  const droppedGeometry = (drag: DragState): DroppedGeometry => {
    const rect = rowRefs.current.get(drag.id)?.getBoundingClientRect();
    return { top: rect?.top ?? 0, left: rect?.left ?? 0, width: rect?.width ?? 0, tilt: drag.tilt };
  };

  const onPointerUp = () => {
    const drag = dragState.current;
    if (drag) {
      // Each of these, if it applies, is presumed to fully own the item's fate (moved
      // elsewhere or removed) — nothing left to animate here, unlike reorder/settle below.
      const deleteResult = drag.overDeleteZone ? (onDelete?.(drag.id) ?? false) : false;
      if (deleteResult === "hold") {
        setHeld({ id: drag.id, offsetX: drag.offsetX, offsetY: drag.offsetY, tilt: drag.tilt });
      }

      const handled =
        deleteResult !== false ||
        (drag.hovered !== null && (onDropInto?.(drag.id, drag.hovered.id, drag.hovered.index, droppedGeometry(drag)) ?? false)) ||
        (drag.escapedContainer && (onEscapeContainer?.(drag.id, drag.lastY, droppedGeometry(drag)) ?? false));

      if (!handled) {
        if (drag.dropIndex !== drag.originalIndex) {
          const row = rowRefs.current.get(drag.id);
          if (row) {
            rowPositions.current.set(drag.id, visualTop(row));
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
    // A touch drag is not followed by a click: without this the next, unrelated tap would be eaten.
    setTimeout(() => window.removeEventListener("click", handler, true), 150);
  };

  const startDrag = (row: HTMLLIElement, id: string, index: number, startX: number, startY: number) => {
    navigator.vibrate?.(15);
    const item = itemRefs.current.get(id);
    row.style.transition = "none";
    if (item) {
      item.style.transition = "none";
    }

    dragState.current = {
      id,
      startX,
      startY,
      lastY: startY,
      originalIndex: index,
      dropIndex: index,
      offsetX: 0,
      offsetY: 0,
      tilt: 0,
      overDeleteZone: false,
      hovered: null,
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
  const ownIndicatorIndex =
    dragId !== null && hovered === null && !escaped && !overDeleteZone && dropIndex !== null && dragOriginalIndex !== null && dropIndex !== dragOriginalIndex
      ? dropIndex >= dragOriginalIndex
        ? dropIndex + 1
        : dropIndex
      : null;
  const indicatorIndex = externalDropIndex ?? ownIndicatorIndex;

  const getItemProps = (item: T, index: number): SortableEntry => {
    const id = getId(item);
    const isDragging = id === dragId;
    const isHeld = held?.id === id;
    const isElevated = id === elevatedId;

    return {
      isDragging: isDragging || isHeld,
      isHovered: !isDragging && !isHeld && id === hovered?.id,
      dropIntoIndex: !isDragging && !isHeld && id === hovered?.id ? hovered.index : null,
      showDropIndicatorBefore: indicatorIndex === index,
      rowProps: {
        ref: (el) => {
          if (el) {
            rowRefs.current.set(id, el);
            observeRow(el);
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
        className: classNames(styles.item, (isDragging ? overDeleteZone : isHeld) && styles.overDeleteZone),
        style: isDragging ? { transform: `rotate(${tilt}deg)` } : isHeld ? { transform: `rotate(${held.tilt}deg)` } : undefined,
        onPointerDown: (e) => handlePointerDown(id, index, e),
        onContextMenu: (e) => e.preventDefault(),
      },
    };
  };

  return {
    getItemProps,
    showTrailingDropIndicator: indicatorIndex === items.length,
    dragging: dragId !== null,
    overDeleteZone,
  };
};
