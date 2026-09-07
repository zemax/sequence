import PlayArrowIcon from "@mui/icons-material/PlayArrow";
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
      <NoDragLink
        to={`/sequence/edit?id=${sequence.id}`}
        className={classNames(styles.cardTitle, styles.stretchedLink)}
      >
        <span className={styles.cardTitleText}>{sequence.name}</span>
        {durationText && <span className={styles.cardDuration}>{durationText}</span>}
      </NoDragLink>
      <NoDragLink to={`/sequence/view?id=${sequence.id}`} className={classNames(components.round, styles.play)} aria-label={play}>
        <PlayArrowIcon />
      </NoDragLink>
    </>
  );
};
