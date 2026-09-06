"use client";

import SaveIcon from "@mui/icons-material/Save";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import classNames from "classnames";
import Link from "next/link";
import { useState } from "react";
import { getUI } from "../../data/informations";
import { Sequence, SequenceItem, Step, addSequence, emptySequence, isLoop, updateSequence } from "../../data/sequences/sequencesSlice";
import store from "../../data/store";
import { useRouter } from "next/navigation";
import { emptyStep } from "../steps/common/emptyStep";
import { CountdownButton } from "../steps/countdown/CountdownButton";
import { CountdownPreview } from "../steps/countdown/CountdownPreview";
import { CountdownPreviewEdit } from "../steps/countdown/CountdownPreviewEdit";
import { PauseButton } from "../steps/pause/PauseButton";
import { PausePreview } from "../steps/pause/PausePreview";
import { PausePreviewEdit } from "../steps/pause/PausePreviewEdit";
import { SortableList } from "../ui/sortableList/SortableList";
import { SortableItem } from "../ui/sortableList/SortableItem";
import { SortableEntry } from "../ui/sortableList/useSortableList";

import components from "../../styles/Components.module.scss";
import styles from "./Sequence.module.scss";

const STEP_DELETE_EDGE_THRESHOLD_PX = 50;

export const SequenceForm = ({ sequence: initialSequence }: { sequence?: Sequence }) => {
  const [sequence, setSequence] = useState(initialSequence || emptySequence());
  const [savedSequence, setSavedSequence] = useState(sequence);
  const [editingId, setEditingId] = useState<string | null>(null);
  const router = useRouter();
  const { nameLabel, addStepLabel, play, save: saveLabel } = getUI();

  const isDirty = JSON.stringify(sequence) !== JSON.stringify(savedSequence);

  const save = () => {
    if (initialSequence) {
      store.dispatch(updateSequence(sequence));
      setSavedSequence(sequence);
    } else {
      store.dispatch(addSequence(sequence));
      router.push("/");
    }
  };

  const addStep = (type: Step["type"]) => {
    const step = emptyStep(type);
    setSequence({ ...sequence, items: [...sequence.items, step] });
    setEditingId(step.id);
  };

  const removeItem = (id: string) => {
    setSequence({ ...sequence, items: sequence.items.filter((item) => item.id !== id) });
    setEditingId((current) => (current === id ? null : current));
  };

  const moveItem = (id: string, toIndex: number) => {
    const items = [...sequence.items];
    const fromIndex = items.findIndex((item) => item.id === id);
    if (fromIndex === -1) {
      return;
    }
    const [item] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, item);
    setSequence({ ...sequence, items });
  };

  const updateItem = (updated: SequenceItem) => {
    setSequence({ ...sequence, items: sequence.items.map((item) => (item.id === updated.id ? updated : item)) });
  };

  const renderItem = (item: SequenceItem, entry: SortableEntry) => {
    if (isLoop(item)) {
      return `Loop x${item.repeatCount}`;
    }

    if (editingId === item.id) {
      return item.type === "countdown" ? (
        <CountdownPreviewEdit step={item} onChange={updateItem} edgeAction={entry.edgeAction} onClick={() => setEditingId(null)} />
      ) : (
        <PausePreviewEdit step={item} onChange={updateItem} edgeAction={entry.edgeAction} onClick={() => setEditingId(null)} />
      );
    }

    return item.type === "countdown" ? (
      <CountdownPreview step={item} elevated={entry.isDragging} edgeAction={entry.edgeAction} onClick={() => setEditingId(item.id)} />
    ) : (
      <PausePreview step={item} elevated={entry.isDragging} edgeAction={entry.edgeAction} onClick={() => setEditingId(item.id)} />
    );
  };

  return (
    <>
      <div className="form-row">
        <input
          type="text"
          className={styles.nameInput}
          value={sequence.name}
          onChange={(e) => setSequence({ ...sequence, name: e.target.value })}
          placeholder={nameLabel}
          aria-label={nameLabel}
        />
      </div>

      <SortableList
        items={sequence.items}
        getId={(item) => item.id}
        onReorder={moveItem}
        paddingX={8}
        paddingY={8}
        edgeActionThreshold={STEP_DELETE_EDGE_THRESHOLD_PX}
        onEdgeAction={(id, edge) => {
          if (edge !== "right") {
            return false;
          }
          removeItem(id);
          return true;
        }}
        className={styles.list}
      >
        {(item, entry) => (
          <SortableItem key={item.id} entry={entry}>
            {renderItem(item, entry)}
          </SortableItem>
        )}
      </SortableList>

      <div className={classNames("form-row", styles.addStepRow)}>
        <span>{addStepLabel}</span>
        <CountdownButton onClick={() => addStep("countdown")} />
        <PauseButton onClick={() => addStep("pause")} />
      </div>

      {initialSequence && !isDirty ? (
        <Link
          href={`/sequence/view?id=${sequence.id}`}
          className={classNames(components.round, components.floating, components.floatingBottomRight, styles.actionButton)}
          aria-label={play}
        >
          <PlayArrowIcon />
        </Link>
      ) : (
        <button
          type="button"
          className={classNames(components.round, components.floating, components.floatingBottomRight, styles.actionButton)}
          onClick={save}
          aria-label={saveLabel}
        >
          <SaveIcon />
        </button>
      )}
    </>
  );
};
