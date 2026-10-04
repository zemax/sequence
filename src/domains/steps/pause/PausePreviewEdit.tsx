import PauseIcon from "@mui/icons-material/Pause";
import { MouseEvent } from "react";
import { getUI } from "../../../data/informations";
import { StepPreview } from "../common/StepPreview";
import { PauseStep } from "./PauseStep";

import stepPreviewStyles from "../common/StepPreview.module.scss";

type Props = {
  step: PauseStep;
  onChange: (step: PauseStep) => void;
  onClick?: () => void;
};

export const PausePreviewEdit = ({ step, onChange, onClick }: Props) => {
  const { stepTitleLabel } = getUI();

  return (
    <StepPreview icon={<PauseIcon />} onClick={onClick}>
      <input
        type="text"
        className={stepPreviewStyles.titleInput}
        value={step.title}
        onChange={(e) => onChange({ ...step, title: e.target.value })}
        onClick={(e: MouseEvent) => e.stopPropagation()}
        aria-label={stepTitleLabel}
      />
    </StepPreview>
  );
};
