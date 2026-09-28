import SaveIcon from "@mui/icons-material/Save";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import classNames from "classnames";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { getUI } from "../../data/informations";
import { Sequence, addSequence, emptySequence, updateSequence } from "../../data/sequences/sequencesSlice";
import store from "../../data/store";
import { StepList } from "../steps/common/StepList";

import components from "../../styles/Components.module.scss";
import styles from "./Sequence.module.scss";

export const SequenceForm = ({ sequence: initialSequence }: { sequence?: Sequence }) => {
  const [sequence, setSequence] = useState(initialSequence || emptySequence());
  const [savedSequence, setSavedSequence] = useState(sequence);
  const navigate = useNavigate();
  const { nameLabel, play, save: saveLabel } = getUI();

  const isDirty = JSON.stringify(sequence) !== JSON.stringify(savedSequence);

  const save = () => {
    if (initialSequence) {
      store.dispatch(updateSequence(sequence));
      setSavedSequence(sequence);
    } else {
      store.dispatch(addSequence(sequence));
      navigate("/");
    }
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

      <StepList items={sequence.items} onChange={(items) => setSequence({ ...sequence, items })} allowLoop />

      {initialSequence && !isDirty ? (
        <Link
          to={`/sequence/view/${sequence.id}`}
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
