import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { getUI } from "../../data/informations";
import { Sequence } from "../../data/sequences/sequencesSlice";
import { selectSoundMuted } from "../../data/settings/settingsSlice";
import { BackButton } from "../ui/components/Back/Back";
import { durationLabel } from "../steps/common/durationLabel";
import { StepView } from "../steps/common/StepView";
import { flattenSequenceItems } from "./flattenSequenceItems";
import { NextButton } from "./NextButton";
import { playStepEndSound } from "./playStepEndSound";
import { PreviousButton } from "./PreviousButton";
import { useWakeLock } from "./useWakeLock";

import components from "../../styles/Components.module.scss";
import styles from "./SequenceView.module.scss";

type Props = {
  sequence?: Sequence;
};

export const SequenceView = ({ sequence }: Props) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const navigate = useNavigate();
  const soundMuted = useSelector(selectSoundMuted);
  const { pause: pauseLabel, resume: resumeLabel, next: nextLabel, progressLabel, upNextLabel } = getUI();

  useWakeLock();

  const steps = sequence ? flattenSequenceItems(sequence.items) : [];
  const step = steps[index];
  const nextStep = steps[index + 1];

  useEffect(() => {
    if (sequence && !step) {
      navigate("/");
    }
  }, [sequence, step, navigate]);

  if (!sequence || !step) {
    return null;
  }

  const goToNext = () => {
    if (!soundMuted) {
      playStepEndSound();
    }
    setPaused(false);
    setIndex((i) => i + 1);
  };
  const goToPrevious = () => {
    setPaused(false);
    setIndex((i) => i - 1);
  };

  const progress = Math.round(((index + 1) / steps.length) * 100);

  return (
    <div className={styles.view}>
      <div className={styles.header}>
        <BackButton />
        <div className={styles.sequenceName}>{sequence.name}</div>
        <div className={styles.headerSpacer} />
      </div>

      <div
        className={styles.progress}
        role="progressbar"
        aria-label={progressLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <div className={styles.progressBar} style={{ width: `${progress}%` }} />
      </div>

      <StepView key={index} step={step} paused={paused} onDone={goToNext} />

      <div className={styles.controls}>
        {index > 0 ? <PreviousButton onClick={goToPrevious} /> : <span className={styles.sideSpacer} />}
        {step.type === "countdown" ? (
          <button
            type="button"
            className={components.actionLarge}
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? resumeLabel : pauseLabel}
          >
            {paused ? <PlayArrowIcon /> : <PauseIcon />}
          </button>
        ) : (
          <button type="button" className={components.actionLarge} onClick={goToNext} aria-label={nextLabel}>
            <SkipNextIcon />
          </button>
        )}
        <NextButton onClick={goToNext} />
      </div>

      <div className={classNames(styles.upNext, !nextStep && styles.upNextHidden)}>
        {nextStep && (
          <>
            <div className={styles.upNextText}>
              <div className={styles.upNextLabel}>{upNextLabel}</div>
              <div className={styles.upNextTitle}>{nextStep.title}</div>
            </div>
            {nextStep.type === "countdown" && <div className={styles.chip}>{durationLabel(nextStep.duration)}</div>}
          </>
        )}
      </div>
    </div>
  );
};
