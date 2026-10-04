import { RefObject, useLayoutEffect, useRef, useState } from "react";
import { getUI } from "../../../data/informations";
import { SequenceItem, isLoop } from "../../../data/sequences/sequencesSlice";
import { ConfirmDialog } from "../../ui/components/ConfirmDialog/ConfirmDialog";
import { animateTransform } from "../../ui/sortableList/animateTransform";
import { layoutTop } from "../../ui/sortableList/layoutTop";
import { SortableList } from "../../ui/sortableList/SortableList";
import { SortableItem } from "../../ui/sortableList/SortableItem";
import { DroppedGeometry, IncomingRow, SortableEntry } from "../../ui/sortableList/useSortableList";
import { CountdownButton } from "../countdown/CountdownButton";
import { CountdownPreview } from "../countdown/CountdownPreview";
import { CountdownPreviewEdit } from "../countdown/CountdownPreviewEdit";
import { LoopButton } from "../loop/LoopButton";
import { LoopPreview } from "../loop/LoopPreview";
import { emptyLoop } from "../loop/emptyLoop";
import { PauseButton } from "../pause/PauseButton";
import { PausePreview } from "../pause/PausePreview";
import { PausePreviewEdit } from "../pause/PausePreviewEdit";
import { emptyStep } from "./emptyStep";

import styles from "./StepList.module.scss";

const DELETE_EDGE_THRESHOLD_PX = 40;

type Props = {
  items: SequenceItem[];
  onChange: (items: SequenceItem[]) => void;
  allowLoop?: boolean;
  // Present only when this list is the one nested inside a Loop's envelope: containerRef is
  // that envelope's bounds, and onEscapeItem is called (with the item already removed from
  // `items`) once a drag carries it past those bounds — the caller decides where it goes.
  containerRef?: RefObject<Element | null>;
  onEscapeItem?: (item: SequenceItem, clientY: number, dropped: DroppedGeometry) => void;
  onEscapePointer?: (clientY: number | null) => void;
};

// Renders a reorderable, editable list of Steps (and, when allowLoop, Loops). Used both for a
// Sequence's own top-level items and, nested, for a Loop's own steps. Steps move in/out of a
// Loop by being dragged onto it (allowLoop lists only) or dragged past its envelope bounds
// (nested lists only) — see docs/drag-reorder.md.
export const StepList = ({ items, onChange, allowLoop = false, containerRef, onEscapeItem, onEscapePointer }: Props) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [escapeDropIndex, setEscapeDropIndex] = useState<number | null>(null);
  const incomingRef = useRef<IncomingRow | null>(null);

  // Read during render, before React updates the DOM, so the add row can slide from its old position.
  const addRowRef = useRef<HTMLDivElement>(null);
  const previousItems = useRef(items);
  const previousAddRowTop = addRowRef.current ? addRowRef.current.getBoundingClientRect().top + window.scrollY : null;
  useLayoutEffect(() => {
    const addRow = addRowRef.current;
    if (addRow && previousAddRowTop !== null && previousItems.current !== items) {
      const offset = previousAddRowTop - layoutTop(addRow);
      if (Math.abs(offset) > 0.5) {
        animateTransform(addRow, `translateY(${offset}px)`);
      }
    }
    previousItems.current = items;
  });
  const { addStepLabel, confirmDeleteTitle } = getUI();

  const addItem = (item: SequenceItem) => {
    onChange([...items, item]);
    setEditingId(item.id);
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
    setEditingId((current) => (current === id ? null : current));
  };

  const moveItem = (id: string, toIndex: number) => {
    const next = [...items];
    const fromIndex = next.findIndex((item) => item.id === id);
    if (fromIndex === -1) {
      return;
    }
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    onChange(next);
  };

  const updateItem = (updated: SequenceItem) => {
    onChange(items.map((item) => (item.id === updated.id ? updated : item)));
  };

  const renderItem = (item: SequenceItem, entry: SortableEntry) => {
    const editing = editingId === item.id;
    const onClick = () => setEditingId(editing ? null : item.id);

    if (isLoop(item)) {
      return (
        <LoopPreview
          loop={item}
          onChange={updateItem}
          edgeAction={entry.edgeAction}
          isHovered={entry.isHovered}
          onEscapeHover={setEscapeDropIndex}
          onEscapeStep={(step, index, dropped) => {
            incomingRef.current = { id: step.id, ...dropped };
            const loopIndex = items.findIndex((i) => i.id === item.id);
            const next = [...items];
            next[loopIndex] = { ...item, steps: item.steps.filter((s) => s.id !== step.id) };
            next.splice(index, 0, step);
            onChange(next);
          }}
        />
      );
    }

    if (editing) {
      return item.type === "countdown" ? (
        <CountdownPreviewEdit step={item} onChange={updateItem} edgeAction={entry.edgeAction} onClick={onClick} />
      ) : (
        <PausePreviewEdit step={item} onChange={updateItem} edgeAction={entry.edgeAction} onClick={onClick} />
      );
    }

    return item.type === "countdown" ? (
      <CountdownPreview step={item} elevated={entry.isDragging} edgeAction={entry.edgeAction} onClick={onClick} />
    ) : (
      <PausePreview step={item} elevated={entry.isDragging} edgeAction={entry.edgeAction} onClick={onClick} />
    );
  };

  return (
    <>
      <SortableList
        items={items}
        getId={(item) => item.id}
        onReorder={moveItem}
        paddingX={8}
        paddingY={8}
        edgeActionThreshold={DELETE_EDGE_THRESHOLD_PX}
        holdId={pendingDeleteId}
        onEdgeAction={(id, edge) => {
          if (edge !== "right") {
            return false;
          }
          setPendingDeleteId(id);
          return "hold";
        }}
        isDropTarget={allowLoop ? isLoop : undefined}
        onDropInto={
          allowLoop
            ? (draggedId, targetId) => {
                const dragged = items.find((i) => i.id === draggedId);
                const target = items.find((i) => i.id === targetId);
                if (!dragged || !target || isLoop(dragged) || !isLoop(target)) {
                  return false;
                }
                const next = items.filter((i) => i.id !== draggedId).map((i) => (i.id === targetId ? { ...target, steps: [...target.steps, dragged] } : i));
                onChange(next);
                return true;
              }
            : undefined
        }
        containerRef={containerRef}
        onEscapePointer={onEscapePointer}
        externalDropIndex={escapeDropIndex}
        incomingRef={incomingRef}
        onEscapeContainer={
          onEscapeItem
            ? (id, clientY, dropped) => {
                const item = items.find((i) => i.id === id);
                if (!item) {
                  return false;
                }
                onChange(items.filter((i) => i.id !== id));
                setEditingId((current) => (current === id ? null : current));
                onEscapeItem(item, clientY, dropped);
                return true;
              }
            : undefined
        }
        className={styles.list}
      >
        {(item, entry) => (
          <SortableItem key={item.id} entry={entry}>
            {renderItem(item, entry)}
          </SortableItem>
        )}
      </SortableList>

      {pendingDeleteId && (
        <ConfirmDialog
          title={confirmDeleteTitle}
          onCancel={() => setPendingDeleteId(null)}
          onConfirm={() => {
            removeItem(pendingDeleteId);
            setPendingDeleteId(null);
          }}
        />
      )}

      {/* A Loop's own nested list (identified by containerRef being set) has no add row —
          Steps only ever arrive there by being dragged in. */}
      {!containerRef && (
        <div ref={addRowRef} className={styles.addStepRow}>
          <span>{addStepLabel}</span>
          <CountdownButton onClick={() => addItem(emptyStep("countdown"))} />
          <PauseButton onClick={() => addItem(emptyStep("pause"))} />
          {allowLoop && <LoopButton onClick={() => addItem(emptyLoop())} />}
        </div>
      )}
    </>
  );
};
