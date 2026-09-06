import TimerIcon from "@mui/icons-material/TimerOutlined";
import { MouseEvent } from "react";
import { getUI } from "../../../data/informations";
import { SortableEdge } from "../../ui/sortableList/useSortableList";
import { StepPreview } from "../common/StepPreview";
import { CountdownStep } from "./CountdownStep";

import stepPreviewStyles from "../common/StepPreview.module.scss";

type Props = {
  step: CountdownStep;
  onChange: (step: CountdownStep) => void;
  edgeAction?: SortableEdge | null;
  onClick?: () => void;
};

const stopPropagation = (e: MouseEvent) => e.stopPropagation();

export const CountdownPreviewEdit = ({ step, onChange, edgeAction, onClick }: Props) => {
  const { stepTitleLabel, stepDurationLabel } = getUI();

  return (
    <StepPreview icon={<TimerIcon />} edgeAction={edgeAction} onClick={onClick}>
      <div className={stepPreviewStyles.editFields}>
        <input
          type="text"
          className={stepPreviewStyles.titleInput}
          value={step.title}
          onChange={(e) => onChange({ ...step, title: e.target.value })}
          onClick={stopPropagation}
          aria-label={stepTitleLabel}
        />
        <label className={stepPreviewStyles.durationField} onClick={stopPropagation}>
          <span className={stepPreviewStyles.secondaryText}>{stepDurationLabel}</span>
          <input
            type="number"
            className={stepPreviewStyles.durationInput}
            value={step.duration}
            onChange={(e) => onChange({ ...step, duration: Number(e.target.value) })}
          />
        </label>
      </div>
    </StepPreview>
  );
};
