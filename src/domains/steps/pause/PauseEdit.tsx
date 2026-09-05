"use client";

import { PauseStep } from "./PauseStep";
import { getUI } from "../../../data/informations";

type Props = {
  step: PauseStep;
  onChange: (step: PauseStep) => void;
};

export const PauseEdit = ({ step, onChange }: Props) => {
  const { stepTitleLabel } = getUI();

  return (
    <div className="form-row">
      <label>{stepTitleLabel}</label>
      <input type="text" value={step.title} onChange={(e) => onChange({ ...step, title: e.target.value })} />
    </div>
  );
};
