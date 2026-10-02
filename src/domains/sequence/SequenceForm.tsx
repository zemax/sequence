import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SaveIcon from "@mui/icons-material/Save";
import ScheduleIcon from "@mui/icons-material/Schedule";
import classNames from "classnames";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { getUI } from "../../data/informations";
import { Sequence, addSequence, emptySequence, updateSequence } from "../../data/sequences/sequencesSlice";
import store from "../../data/store";
import { durationLabel } from "../steps/common/durationLabel";
import { StepList } from "../steps/common/StepList";
import { sequenceDuration } from "./sequenceDuration";

import components from "../../styles/Components.module.scss";
import styles from "./Sequence.module.scss";

export const SequenceForm = ({ sequence: initialSequence }: { sequence?: Sequence }) => {
  const [sequence, setSequence] = useState(initialSequence || emptySequence());
  const [savedSequence, setSavedSequence] = useState(sequence);
  const navigate = useNavigate();
  const { nameLabel, totalDurationLabel, play, save: saveLabel } = getUI();
  const totalDuration = sequenceDuration(sequence);

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
      <input
        type="text"
        className={styles.nameInput}
        value={sequence.name}
        onChange={(e) => setSequence({ ...sequence, name: e.target.value })}
        placeholder={nameLabel}
        aria-label={nameLabel}
      />
      {totalDuration !== undefined && (
        <div className={styles.totalDuration}>
          <ScheduleIcon aria-hidden />
          <span>
            {totalDurationLabel} : {durationLabel(totalDuration)}
          </span>
        </div>
      )}

      <StepList items={sequence.items} onChange={(items) => setSequence({ ...sequence, items })} allowLoop />

      {initialSequence && !isDirty ? (
        <Link
          to={`/sequence/view/${sequence.id}`}
          className={classNames(components.action, components.floating, components.floatingBottomRight)}
          aria-label={play}
        >
          <PlayArrowIcon />
        </Link>
      ) : (
        <button
          type="button"
          className={classNames(components.action, components.floating, components.floatingBottomRight)}
          onClick={save}
          aria-label={saveLabel}
        >
          <SaveIcon />
        </button>
      )}
    </>
  );
};
