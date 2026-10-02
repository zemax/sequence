import { PauseStep } from "./PauseStep";

import styles from "./PauseView.module.scss";

type Props = {
  step: PauseStep;
  onDone: () => void;
};

export const PauseView = ({ step, onDone }: Props) => (
  <button type="button" className={styles.pause} onClick={onDone}>
    <h1 className={styles.title}>{step.title}</h1>
  </button>
);
