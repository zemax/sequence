import PauseIcon from "@mui/icons-material/Pause";
import { SortableEdge } from "../../ui/sortableList/useSortableList";
import { StepPreview } from "../common/StepPreview";
import { PauseStep } from "./PauseStep";

type Props = {
  step: PauseStep;
  elevated?: boolean;
  edgeAction?: SortableEdge | null;
};

export const PausePreview = ({ step, elevated, edgeAction }: Props) => (
  <StepPreview icon={<PauseIcon />} elevated={elevated} edgeAction={edgeAction}>
    {step.title}
  </StepPreview>
);
