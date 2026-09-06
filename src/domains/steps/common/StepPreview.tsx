import { ReactNode } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import classNames from "classnames";
import { SortableEdge } from "../../ui/sortableList/useSortableList";

import styles from "./StepPreview.module.scss";

type Props = {
  icon: ReactNode;
  elevated?: boolean;
  edgeAction?: SortableEdge | null;
  children: ReactNode;
};

// Generic visual shell for a step's preview — extended by CountdownPreview/PausePreview.
export const StepPreview = ({ icon, elevated, edgeAction, children }: Props) => (
  <div className={classNames(styles.stepPreview, elevated && styles.elevated)}>
    <span className={styles.icon}>{icon}</span>
    <span className={styles.content}>{children}</span>
    <div className={classNames(styles.deleteOverlay, edgeAction === "right" && styles.deleteOverlayVisible)}>
      <DeleteIcon />
    </div>
  </div>
);
