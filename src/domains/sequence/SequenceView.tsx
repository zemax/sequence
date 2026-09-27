import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { Sequence } from "../../data/sequences/sequencesSlice";
import { selectSoundMuted } from "../../data/settings/settingsSlice";
import { BackButton } from "../ui/components/Back/Back";
import { StepView } from "../steps/common/StepView";
import { flattenSequenceItems } from "./flattenSequenceItems";
import { NextButton } from "./NextButton";
import { playStepEndSound } from "./playStepEndSound";
import { PreviousButton } from "./PreviousButton";
import { useWakeLock } from "./useWakeLock";

import styles from "./SequenceView.module.scss";

type Props = {
  sequence?: Sequence;
};

export const SequenceView = ({ sequence }: Props) => {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const soundMuted = useSelector(selectSoundMuted);

  useWakeLock();

  const steps = sequence ? flattenSequenceItems(sequence.items) : [];
  const step = steps[index];

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
    setIndex((i) => i + 1);
  };
  const goToPrevious = () => setIndex((i) => i - 1);

  return (
    <>
      <StepView key={index} step={step} onDone={goToNext} />
      <BackButton />
      <div className={styles.controls}>
        {index > 0 && <PreviousButton onClick={goToPrevious} />}
        <NextButton onClick={goToNext} />
      </div>
    </>
  );
};
