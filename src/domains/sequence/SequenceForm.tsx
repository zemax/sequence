"use client";

import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import classNames from "classnames";
import Link from "next/link";
import { useState } from "react";
import { getUI } from "../../data/informations";
import { Sequence, Step, addSequence, emptySequence, isLoop, updateSequence } from "../../data/sequences/sequencesSlice";
import store from "../../data/store";
import { useRouter } from "next/navigation";
import { StepEdit } from "../steps/common/StepEdit";
import { emptyStep } from "../steps/common/emptyStep";
import { stepTypeOptionLabel, stepTypes } from "../steps/common/stepTypes";
import { CountdownPreview } from "../steps/countdown/CountdownPreview";
import { PausePreview } from "../steps/pause/PausePreview";
import { SortableList } from "../ui/sortableList/SortableList";
import { SortableItem } from "../ui/sortableList/SortableItem";

import components from "../../styles/Components.module.scss";
import styles from "./Sequence.module.scss";

const STEP_DELETE_EDGE_THRESHOLD_PX = 50;

export const SequenceForm = ({ sequence: initialSequence }: { sequence?: Sequence }) => {
  const [sequence, setSequence] = useState(initialSequence || emptySequence());
  const [savedSequence, setSavedSequence] = useState(sequence);
  const [newStep, setNewStep] = useState<Step>(emptyStep("countdown"));
  const router = useRouter();
  const { nameLabel, stepTypeLabel, play, save: saveLabel } = getUI();

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

  const changeStepType = (type: Step["type"]) => {
    const isCustomTitle = newStep.title !== emptyStep(newStep.type).title;
    const next = emptyStep(type);
    setNewStep(isCustomTitle ? { ...next, title: newStep.title } : next);
  };

  const addStep = () => {
    if (!newStep.title) {
      return;
    }
    setSequence({ ...sequence, items: [...sequence.items, newStep] });
    setNewStep(emptyStep(newStep.type));
  };

  const removeItem = (id: string) => {
    setSequence({ ...sequence, items: sequence.items.filter((item) => item.id !== id) });
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
            {isLoop(item) ? (
              `Loop x${item.repeatCount}`
            ) : item.type === "countdown" ? (
              <CountdownPreview step={item} elevated={entry.isDragging} edgeAction={entry.edgeAction} />
            ) : (
              <PausePreview step={item} elevated={entry.isDragging} edgeAction={entry.edgeAction} />
            )}
          </SortableItem>
        )}
      </SortableList>

      <div className="form-row">
        <label>{stepTypeLabel}</label>
        <select value={newStep.type} onChange={(e) => changeStepType(e.target.value as Step["type"])}>
          {stepTypes.map((type) => (
            <option key={type} value={type}>
              {stepTypeOptionLabel(type)}
            </option>
          ))}
        </select>
      </div>

      <StepEdit step={newStep} onChange={setNewStep} />

      <div className="form-row form-row--submit">
        <button type="button" onClick={addStep}>
          <AddIcon />
        </button>
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
