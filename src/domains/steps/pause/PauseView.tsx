import SkipNextIcon from "@mui/icons-material/SkipNext";
import { PauseStep } from "./PauseStep";

import components from "../../../styles/Components.module.scss";
import styles from "./PauseView.module.scss";

type Props = {
  step: PauseStep;
  onDone: () => void;
};

export const PauseView = ({ step, onDone }: Props) => (
  <button type="button" className={styles.pause} onClick={onDone}>
    <h1>{step.title}</h1>
    <span className={components.round}>
      <SkipNextIcon />
    </span>
  </button>
);
