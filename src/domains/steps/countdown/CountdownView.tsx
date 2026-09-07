import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { getUI } from "../../../data/informations";
import { CountdownStep } from "./CountdownStep";

import components from "../../../styles/Components.module.scss";
import styles from "./CountdownView.module.scss";

type Props = {
  step: CountdownStep;
  onDone: () => void;
};

const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const formatClock = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

export const CountdownView = ({ step, onDone }: Props) => {
  const durationMs = step.duration * 1000;

  const [remainingMs, setRemainingMs] = useState(durationMs);
  const [paused, setPaused] = useState(false);
  const elapsedBeforePauseRef = useRef(0);
  const segmentStartRef = useRef(Date.now());
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  // Tracks real elapsed time (Date.now()) rather than counting setTimeout ticks, so the
  // countdown stays accurate even if the tab is backgrounded/throttled — a chain of 1s
  // setTimeouts drifts and can stall for many seconds once the browser throttles timers.
  useEffect(() => {
    if (paused) {
      return;
    }

    segmentStartRef.current = Date.now();
    let frameId: number;

    const tick = () => {
      const elapsedMs = elapsedBeforePauseRef.current + (Date.now() - segmentStartRef.current);
      const nextRemainingMs = Math.max(0, durationMs - elapsedMs);
      setRemainingMs(nextRemainingMs);

      if (nextRemainingMs > 0) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      elapsedBeforePauseRef.current += Date.now() - segmentStartRef.current;
    };
  }, [paused, durationMs]);

  // Runs after the 0ms state above has actually painted (the ring fully empties) before
  // advancing — calling onDone directly from the tick above would batch with that same
  // state update and skip straight to the next step without ever showing the ring empty.
  useEffect(() => {
    if (remainingMs <= 0) {
      onDoneRef.current();
    }
  }, [remainingMs]);

  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const { pause: pauseLabel, resume: resumeLabel } = getUI();
  const progress = durationMs > 0 ? remainingMs / durationMs : 0;

  return (
    <div className={styles.countdown}>
      <div className={styles.titleZone}>
        <h1>{step.title}</h1>
      </div>

      <div className={styles.progress}>
        <svg viewBox="0 0 200 200" className={styles.progressSvg}>
          <circle cx="100" cy="100" r={RADIUS} className={styles.progressTrack} />
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            className={styles.progressBar}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          />
        </svg>
        <span className={classNames(styles.clock, paused && styles.blinking)}>{formatClock(remainingSeconds)}</span>
      </div>

      <div className={styles.toggleZone}>
        <button
          type="button"
          className={components.round}
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? resumeLabel : pauseLabel}
        >
          {paused ? <PlayArrowIcon /> : <PauseIcon />}
        </button>
      </div>
    </div>
  );
};
