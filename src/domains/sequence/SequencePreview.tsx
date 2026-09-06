import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import classNames from "classnames";
import { getUI } from "../../data/informations";
import { sequenceDuration } from "./sequenceDuration";
import { sequenceDurationLabel } from "./sequenceDurationLabel";
import { NoDragLink } from "../ui/sortableList/NoDragLink";

import components from "../../styles/Components.module.scss";
import styles from "./Sequence.module.scss";

export const SequencePreview = ({ sequence }) => {
  const { play } = getUI();
  const durationLabel = sequenceDurationLabel(sequenceDuration(sequence));

  return (
    <>
      <NoDragLink
        href={`/sequence/edit?id=${sequence.id}`}
        className={classNames(styles.cardTitle, styles.stretchedLink)}
      >
        <span className={styles.cardTitleText}>{sequence.name}</span>
        {durationLabel && <span className={styles.cardDuration}>{durationLabel}</span>}
      </NoDragLink>
      <NoDragLink href={`/sequence/view?id=${sequence.id}`} className={classNames(components.round, styles.play)} aria-label={play}>
        <PlayArrowIcon />
      </NoDragLink>
    </>
  );
};
