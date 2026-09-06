import TimerIcon from "@mui/icons-material/TimerOutlined";
import { SortableEdge } from "../../ui/sortableList/useSortableList";
import { durationLabel } from "../common/durationLabel";
import { StepPreview } from "../common/StepPreview";
import { CountdownStep } from "./CountdownStep";

import stepPreviewStyles from "../common/StepPreview.module.scss";

type Props = {
  step: CountdownStep;
  elevated?: boolean;
  edgeAction?: SortableEdge | null;
  onClick?: () => void;
};

export const CountdownPreview = ({ step, elevated, edgeAction, onClick }: Props) => (
  <StepPreview icon={<TimerIcon />} elevated={elevated} edgeAction={edgeAction} onClick={onClick}>
    <div className={stepPreviewStyles.previewFields}>
      <span>{step.title}</span>
      <span className={stepPreviewStyles.secondaryText}>{durationLabel(step.duration)}</span>
    </div>
  </StepPreview>
);
