import { KeyboardEvent, PointerEvent, useRef } from "react";
import classNames from "classnames";
import { getUI } from "../../data/informations";
import { playStepEndSound, unlockStepEndSound } from "../sequence/playStepEndSound";

import styles from "./SoundLevelSlider.module.scss";

type Props = {
  value: number;
  count: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  label: string;
};

// A stepped slider: the thumb only ever sits on one of `count` graduations, snapping to the
// nearest one while dragged, and the sound of a level plays each time the thumb lands on it.
export const SoundLevelSlider = ({ value, count, onChange, disabled, label }: Props) => {
  const { settingsSoundLevelMin, settingsSoundLevelMax, settingsSoundLevelValue } = getUI();
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const select = (level: number, force = false) => {
    if (level === value && !force) {
      return;
    }
    playStepEndSound(level);
    if (level !== value) {
      onChange(level);
    }
  };

  const levelAt = (clientX: number): number => {
    const rect = trackRef.current!.getBoundingClientRect();
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    return Math.round(ratio * (count - 1)) + 1;
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }
    unlockStepEndSound();
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    select(levelAt(e.clientX), true);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) {
      select(levelAt(e.clientX));
    }
  };

  const handlePointerEnd = () => {
    dragging.current = false;
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const steps: Record<string, number> = {
      ArrowLeft: value - 1,
      ArrowDown: value - 1,
      ArrowRight: value + 1,
      ArrowUp: value + 1,
      Home: 1,
      End: count,
    };
    if (!(e.key in steps)) {
      return;
    }
    e.preventDefault();
    select(Math.min(Math.max(steps[e.key], 1), count));
  };

  const fraction = (level: number) => (level - 1) / (count - 1);

  return (
    <div className={classNames(styles.slider, disabled && styles.disabled)}>
      <div
        className={styles.control}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuemin={1}
        aria-valuemax={count}
        aria-valuenow={value}
        aria-valuetext={settingsSoundLevelValue(value, count)}
        aria-disabled={disabled}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onKeyDown={handleKeyDown}
      >
        <div ref={trackRef} className={styles.track}>
          <div className={styles.rail} />
          <div className={styles.fill} style={{ width: `${fraction(value) * 100}%` }} />
          {Array.from({ length: count }, (_, i) => (
            <span
              key={i}
              className={classNames(styles.tick, i + 1 <= value && styles.tickReached)}
              style={{ left: `${fraction(i + 1) * 100}%` }}
            />
          ))}
          <div className={styles.thumb} style={{ left: `${fraction(value) * 100}%` }} />
        </div>
      </div>

      <div className={styles.captions} aria-hidden>
        <span>{settingsSoundLevelMin}</span>
        <span>{settingsSoundLevelMax}</span>
      </div>
    </div>
  );
};
