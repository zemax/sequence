import { ReactNode } from "react";
import classNames from "classnames";

import styles from "./StepPreview.module.scss";

type Props = {
  icon: ReactNode;
  elevated?: boolean;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
};

// Generic visual shell for a step's preview — extended by CountdownPreview/PausePreview
// (and their editable counterparts, CountdownPreviewEdit/PausePreviewEdit).
export const StepPreview = ({ icon, elevated, onClick, className, children }: Props) => (
  <div className={classNames(styles.stepPreview, elevated && styles.elevated, className)} onClick={onClick}>
    <span className={styles.icon}>{icon}</span>
    <span className={styles.content}>{children}</span>
  </div>
);
