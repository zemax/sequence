import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ScheduleIcon from "@mui/icons-material/Schedule";
import classNames from "classnames";
import { getUI } from "../../data/informations";
import { durationLabel } from "../steps/common/durationLabel";
import { sequenceDuration } from "./sequenceDuration";
import { NoDragLink } from "../ui/sortableList/NoDragLink";

import components from "../../styles/Components.module.scss";
import styles from "./Sequence.module.scss";

export const SequencePreview = ({ sequence }) => {
  const { play } = getUI();
  const durationText = durationLabel(sequenceDuration(sequence));

  return (
    <>
      <NoDragLink to={`/sequence/edit/${sequence.id}`} className={styles.cardTitle}>
        <span className={styles.cardTitleText}>{sequence.name}</span>
        {durationText && (
          <span className={styles.cardDuration}>
            <ScheduleIcon aria-hidden />
            {durationText}
          </span>
        )}
      </NoDragLink>
      <NoDragLink
        to={`/sequence/view/${sequence.id}`}
        className={classNames(components.round, styles.play)}
        aria-label={`${play} ${sequence.name}`}
      >
        <PlayArrowIcon />
      </NoDragLink>
    </>
  );
};
