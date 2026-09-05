"use client";

import { CountdownStep } from "./CountdownStep";
import { getUI } from "../../../data/informations";

type Props = {
  step: CountdownStep;
  onChange: (step: CountdownStep) => void;
};

export const CountdownEdit = ({ step, onChange }: Props) => {
  const { stepTitleLabel, stepDurationLabel } = getUI();

  return (
    <>
      <div className="form-row">
        <label>{stepTitleLabel}</label>
        <input type="text" value={step.title} onChange={(e) => onChange({ ...step, title: e.target.value })} />
      </div>
      <div className="form-row">
        <label>{stepDurationLabel}</label>
        <input
          type="number"
          value={step.duration}
          onChange={(e) => onChange({ ...step, duration: Number(e.target.value) })}
        />
      </div>
    </>
  );
};
