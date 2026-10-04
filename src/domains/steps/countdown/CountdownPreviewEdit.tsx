import TimerIcon from "@mui/icons-material/TimerOutlined";
import { ChangeEvent, MouseEvent, useState } from "react";
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

  // Own text state: binding the input to the number turns an emptied field back into 0.
  const [durationText, setDurationText] = useState(String(step.duration));

  const handleDurationChange = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setDurationText(text);

    const duration = Number(text);
    if (text !== "" && Number.isFinite(duration) && duration >= 0) {
      onChange({ ...step, duration: Math.floor(duration) });
    }
  };

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
            min={0}
            inputMode="numeric"
            className={stepPreviewStyles.durationInput}
            value={durationText}
            onChange={handleDurationChange}
            onFocus={(e) => e.target.select()}
            onBlur={() => setDurationText(String(step.duration))}
          />
        </label>
      </div>
    </StepPreview>
  );
};
