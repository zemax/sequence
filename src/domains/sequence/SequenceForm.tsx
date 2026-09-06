"use client";

import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";
import { getUI } from "../../data/informations";
import { Sequence, Step, addSequence, emptySequence, isLoop, updateSequence } from "../../data/sequences/sequencesSlice";
import store from "../../data/store";
import { useRouter } from "next/navigation";
import { StepEdit } from "../steps/common/StepEdit";
import { StepPreview } from "../steps/common/StepPreview";
import { emptyStep } from "../steps/common/emptyStep";
import { stepTypeOptionLabel, stepTypes } from "../steps/common/stepTypes";

import components from "../../styles/Components.module.scss";
import styles from "./Sequence.module.scss";

export const SequenceForm = ({ sequence: initialSequence }: { sequence?: Sequence }) => {
  const [sequence, setSequence] = useState(initialSequence || emptySequence());
  const [newStep, setNewStep] = useState<Step>(emptyStep("countdown"));
  const router = useRouter();
  const { nameLabel, stepsTitle, stepTypeLabel } = getUI();

  const save = () => {
    initialSequence ? store.dispatch(updateSequence(sequence)) : store.dispatch(addSequence(sequence));
    router.push("/");
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

  return (
    <>
      <div className="form-row">
        <label>{nameLabel}</label>
        <input
          type="text"
          value={sequence.name}
          onChange={(e) => setSequence({ ...sequence, name: e.target.value })}
        />
      </div>

      <h2>{stepsTitle}</h2>

      <ul className={styles.list}>
        {sequence.items.map((item) => (
          <li key={item.id} className={styles.listItem}>
            <span className={styles.listItemTitle}>
              {isLoop(item) ? `Loop x${item.repeatCount}` : <StepPreview step={item} />}
            </span>
            <button type="button" className={components.icon} onClick={() => removeItem(item.id)}>
              <DeleteIcon />
            </button>
          </li>
        ))}
      </ul>

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

      <div className="form-row form-row--submit">
        <button type="button" onClick={save}>
          <SaveIcon />
        </button>
      </div>
    </>
  );
};
