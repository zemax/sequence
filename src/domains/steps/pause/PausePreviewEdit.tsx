import PauseIcon from "@mui/icons-material/Pause";
import { MouseEvent } from "react";
import { getUI } from "../../../data/informations";
import { SortableEdge } from "../../ui/sortableList/useSortableList";
import { StepPreview } from "../common/StepPreview";
import { PauseStep } from "./PauseStep";

import stepPreviewStyles from "../common/StepPreview.module.scss";

type Props = {
  step: PauseStep;
  onChange: (step: PauseStep) => void;
  edgeAction?: SortableEdge | null;
  onClick?: () => void;
};

export const PausePreviewEdit = ({ step, onChange, edgeAction, onClick }: Props) => {
  const { stepTitleLabel } = getUI();

  return (
    <StepPreview icon={<PauseIcon />} edgeAction={edgeAction} onClick={onClick}>
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
