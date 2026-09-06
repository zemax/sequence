import classNames from "classnames";

import styles from "./SortableList.module.scss";

export const SortableDropIndicator = ({ active }: { active: boolean }) => (
  <div className={classNames(styles.dropIndicator, active && styles.dropIndicatorActive)} />
);
