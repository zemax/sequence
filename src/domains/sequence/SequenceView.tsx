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
import { StepView } from "../steps/common/StepView";
import { flattenPlayback } from "./flattenPlayback";
import { NextButton } from "./NextButton";
import { playStepEndSound, unlockStepEndSound } from "./playStepEndSound";
import { PreviousButton } from "./PreviousButton";
import { UpNextCard } from "./UpNextCard";
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
  const { pause: pauseLabel, resume: resumeLabel, next: nextLabel, progressLabel } = getUI();

  useWakeLock();

  useEffect(unlockStepEndSound, []);

  const entries = sequence ? flattenPlayback(sequence.items) : [];
  const entry = entries[index];
  const step = entry?.step;
  const nextStep = entries[index + 1]?.step;

  useEffect(() => {
    if (sequence && !step) {
      navigate("/");
    }
  }, [sequence, step, navigate]);

  if (!sequence || !step) {
    return null;
  }

  const goTo = (target: (i: number) => number) => {
    if (!soundMuted) {
      playStepEndSound();
    }
    setPaused(false);
    setIndex(target);
  };
  const goToNext = () => goTo((i) => i + 1);
  const skipLoop = () => entry.loop && goTo(() => entry.loop!.exitIndex);
  const goToPrevious = () => {
    setPaused(false);
    setIndex((i) => i - 1);
  };

  const progress = Math.round(((index + 1) / entries.length) * 100);
  const hasLoop = entries.some((e) => e.loop);

  return (
    <div className={classNames(styles.view, hasLoop && styles.withLoop)} onPointerDown={unlockStepEndSound}>
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

      <StepView key={index} step={step} paused={paused} onDone={goToNext}>
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
      </StepView>

      <div className={styles.cardSlot}>
        <UpNextCard nextStep={nextStep} loop={entry.loop} onSkipLoop={skipLoop} />
      </div>
    </div>
  );
};
