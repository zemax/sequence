import { ReactNode } from "react";
import classNames from "classnames";

import styles from "./StepStage.module.scss";

type Props = {
  title: ReactNode;
  ring?: ReactNode;
  controls: ReactNode;
};

// The playback layout shared by every Step type: title / ring / controls rows. The ring row has
// the same height whether or not the Step draws a ring, so the controls below it never move from
// one Step to the next. See docs/concepts.md (Playback) for the sizing rules.
export const StepStage = ({ title, ring, controls }: Props) => (
  <div className={styles.stage}>
    <div className={classNames(styles.grid, !ring && styles.noRing)}>
      <div className={styles.title}>{title}</div>
      {ring && <div className={styles.ring}>{ring}</div>}
      <div className={styles.controls}>{controls}</div>
    </div>
  </div>
);
