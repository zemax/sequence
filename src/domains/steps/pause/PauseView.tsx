import { ReactNode } from "react";
import { StepStage } from "../common/StepStage";
import { PauseStep } from "./PauseStep";

import styles from "./PauseView.module.scss";

type Props = {
  step: PauseStep;
  onDone: () => void;
  children: ReactNode;
};

// The title area is the tap target; the controls under it work on their own.
export const PauseView = ({ step, onDone, children }: Props) => (
  <StepStage
    title={
      <button type="button" className={styles.pause} onClick={onDone}>
        <h1 className={styles.title}>{step.title}</h1>
      </button>
    }
    controls={children}
  />
);
