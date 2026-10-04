import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import LoopIcon from "@mui/icons-material/Loop";
import { getUI } from "../../data/informations";
import { Step } from "../../data/sequences/sequencesSlice";
import { durationLabel } from "../steps/common/durationLabel";
import { PlaybackLoop } from "./flattenPlayback";

import styles from "./UpNextCard.module.scss";

type Props = {
  nextStep?: Step;
  loop?: PlaybackLoop;
  onSkipLoop: () => void;
};

export const UpNextCard = ({ nextStep, loop, onSkipLoop }: Props) => {
  const { upNextLabel, skipLoopLabel, loopProgressLabel } = getUI();

  if (!nextStep && !loop) {
    return null;
  }

  return (
    <div className={styles.card}>
      {loop && (
        <div className={styles.loopRow}>
          <div className={styles.loopInfo}>
            <LoopIcon aria-hidden />
            <span>{loopProgressLabel(loop.iteration, loop.repeatCount)}</span>
          </div>
          <button type="button" className={styles.skipLoop} onClick={onSkipLoop}>
            <span>{skipLoopLabel}</span>
            <KeyboardDoubleArrowRightIcon aria-hidden />
          </button>
        </div>
      )}

      {nextStep && (
        <div className={styles.upNext}>
          <div className={styles.upNextText}>
            <div className={styles.upNextLabel}>{upNextLabel}</div>
            <div className={styles.upNextTitle}>{nextStep.title}</div>
          </div>
          {nextStep.type === "countdown" && <div className={styles.chip}>{durationLabel(nextStep.duration)}</div>}
        </div>
      )}
    </div>
  );
};
