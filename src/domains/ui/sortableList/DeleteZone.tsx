import DeleteIcon from "@mui/icons-material/Delete";
import { RefObject } from "react";
import classNames from "classnames";
import { getUI } from "../../../data/informations";

import styles from "./DeleteZone.module.scss";

type Props = {
  zoneRef: RefObject<HTMLDivElement | null>;
  visible: boolean;
  over: boolean;
};

export const DeleteZone = ({ zoneRef, visible, over }: Props) => {
  const { deleteZoneLabel } = getUI();

  return (
    <div ref={zoneRef} className={classNames(styles.zone, visible && styles.visible, over && styles.over)} aria-hidden>
      <DeleteIcon />
      <span>{deleteZoneLabel}</span>
    </div>
  );
};
