"use client";

import { PointerEvent as ReactPointerEvent, useLayoutEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import classNames from "classnames";
import { moveSequence, selectSequences } from "../../data/sequences/sequencesSlice";
import store from "../../data/store";
import { SequencePreview } from "./SequencePreview";

import styles from "./Sequence.module.scss";

const MAX_TILT = 10;
const TILT_FACTOR = 1.2;
const TILT_LERP = 0.25;
const REORDER_TRANSITION_MS = 250;

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
};

type PendingCardSettle = {
  id: string;
  offsetX: number;
  tilt: number;
};

export const SequenceList = () => {
  const sequences = useSelector(selectSequences);

  const [dragId, setDragId] = useState<string | null>(null);
  const [elevatedId, setElevatedId] = useState<string | null>(null);
  const [dragOriginalIndex, setDragOriginalIndex] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState(0);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const dragState = useRef<DragState | null>(null);
  const elevationTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Tilt is driven by its own rAF loop, sampled at a fixed cadence and smoothed (lerp)
  // frame to frame — reacting to each raw pointermove's delta directly is noisy (irregular
  // event timing) and kept re-triggering the CSS transition mid-interpolation, causing jitter.
  const rafId = useRef<number | null>(null);
  const pointerX = useRef(0);
  const frameX = useRef(0);
  const currentTilt = useRef(0);

  const rowRefs = useRef(new Map<string, HTMLLIElement>());
  const cardRefs = useRef(new Map<string, HTMLDivElement>());
  const rowPositions = useRef(new Map<string, number>());
  // When a drop reorders the list, the dragged row's settle animation must wait until
  // *after* React has physically moved its DOM node to its new position — animating it
  // beforehand gets cut short by that move. This holds the animation to apply once that happens.
  const pendingCardSettle = useRef<PendingCardSettle | null>(null);

  const animateTransform = (el: HTMLElement, fromTransform: string) => {
    el.style.transition = "none";
    el.style.transform = fromTransform;
    el.getBoundingClientRect(); // force layout so the browser registers the starting transform first
    el.style.transition = `transform ${REORDER_TRANSITION_MS}ms ease`;
    el.style.transform = "";
  };

  const scheduleElevationClear = () => {
    clearTimeout(elevationTimeout.current);
    elevationTimeout.current = setTimeout(() => setElevatedId(null), REORDER_TRANSITION_MS);
  };

  // FLIP: smoothly animate rows into their new spot whenever the order changes.
  useLayoutEffect(() => {
    rowRefs.current.forEach((row, id) => {
      const newTop = row.getBoundingClientRect().top;
      const pending = pendingCardSettle.current;

      if (pending && pending.id === id) {
        const previousTop = rowPositions.current.get(id) ?? newTop;
        const card = cardRefs.current.get(id);

        animateTransform(row, `translate(${pending.offsetX}px, ${previousTop - newTop}px)`);
        if (card) {
          animateTransform(card, `rotate(${pending.tilt}deg)`);
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
  }, [sequences]);

  // Animate the just-released card back to identity (translate + rotate) from wherever
  // it currently is, instead of snapping. Only safe to call when the drop doesn't reorder
  // the list — otherwise the row's DOM node is about to move and would cut the animation short.
  const settleDraggedCardInPlace = (id: string, offsetX: number, offsetY: number, cardTilt: number) => {
    const row = rowRefs.current.get(id);
    const card = cardRefs.current.get(id);
    if (!row || !card) {
      return;
    }

    animateTransform(row, `translate(${offsetX}px, ${offsetY}px)`);
    animateTransform(card, `rotate(${cardTilt}deg)`);
    scheduleElevationClear();
  };

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
    const nextDropIndex = Math.max(0, Math.min(sequences.length - 1, drag.originalIndex + slotOffset));
    drag.dropIndex = nextDropIndex;
    setDropIndex(nextDropIndex);
  };

  const onPointerUp = () => {
    const drag = dragState.current;
    if (drag) {
      if (drag.dropIndex !== drag.originalIndex) {
        const row = rowRefs.current.get(drag.id);
        if (row) {
          // Record where the card visually is right now, so the deferred settle (once the
          // reorder has moved this row's DOM node) continues from here, not from a snap-back.
          rowPositions.current.set(drag.id, row.getBoundingClientRect().top);
        }
        pendingCardSettle.current = { id: drag.id, offsetX: drag.offsetX, tilt: drag.tilt };
        store.dispatch(moveSequence({ id: drag.id, toIndex: drag.dropIndex }));
      } else {
        settleDraggedCardInPlace(drag.id, drag.offsetX, drag.offsetY, drag.tilt);
      }
    }
    endDrag();
  };

  const onPointerCancel = () => {
    const drag = dragState.current;
    if (drag) {
      settleDraggedCardInPlace(drag.id, drag.offsetX, drag.offsetY, drag.tilt);
    }
    endDrag();
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLLIElement>, id: string, index: number) => {
    const row = e.currentTarget;
    const card = cardRefs.current.get(id);
    row.style.transition = "none"; // clear any leftover settle transition so the drag-follow stays instant
    if (card) {
      card.style.transition = "none";
    }
    const rect = row.getBoundingClientRect();
    const marginBottom = parseFloat(getComputedStyle(row).marginBottom || "0");

    dragState.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      slotHeight: rect.height + marginBottom,
      originalIndex: index,
      dropIndex: index,
      offsetX: 0,
      offsetY: 0,
      tilt: 0,
    };

    pointerX.current = e.clientX;
    frameX.current = e.clientX;
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

  // Index (in the still-unreordered array) before which the drop indicator should appear.
  // moveSequence removes then re-inserts, so moving forward shifts the visual anchor by one.
  const indicatorIndex =
    dragId !== null && dropIndex !== null && dragOriginalIndex !== null && dropIndex !== dragOriginalIndex
      ? dropIndex >= dragOriginalIndex
        ? dropIndex + 1
        : dropIndex
      : null;

  return (
    <ul className={styles.list}>
      {sequences.map((sequence, index) => {
        const isDragging = sequence.id === dragId;
        const isElevated = sequence.id === elevatedId;

        return (
          <li
            key={sequence.id}
            ref={(el) => {
              if (el) {
                rowRefs.current.set(sequence.id, el);
              } else {
                rowRefs.current.delete(sequence.id);
              }
            }}
            className={classNames(styles.listRow, isElevated && styles.listRowElevated)}
            style={isDragging ? { transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)` } : undefined}
            onPointerDown={(e) => onPointerDown(e, sequence.id, index)}
          >
            <div className={classNames(styles.dropIndicator, indicatorIndex === index && styles.dropIndicatorActive)} />
            <div
              ref={(el) => {
                if (el) {
                  cardRefs.current.set(sequence.id, el);
                } else {
                  cardRefs.current.delete(sequence.id);
                }
              }}
              className={classNames(styles.card, isDragging && styles.cardDragging)}
              style={isDragging ? { transform: `rotate(${tilt}deg)` } : undefined}
            >
              <SequencePreview sequence={sequence} />
            </div>
          </li>
        );
      })}
      <li>
        <div className={classNames(styles.dropIndicator, indicatorIndex === sequences.length && styles.dropIndicatorActive)} />
      </li>
    </ul>
  );
};
