import { ReactNode } from "react";
import classNames from "classnames";

import styles from "./StepStage.module.scss";

type Props = {
  title: ReactNode;
  ring?: ReactNode;
  controls: ReactNode;
};

export const StepStage = ({ title, ring, controls }: Props) => (
  <div className={styles.stage}>
    <div className={classNames(styles.grid, !ring && styles.noRing)}>
      <div className={styles.title}>{title}</div>
      {ring && <div className={styles.ring}>{ring}</div>}
      <div className={styles.controls}>{controls}</div>
    </div>
  </div>
);
