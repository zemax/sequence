import TimerIcon from "@mui/icons-material/TimerOutlined";
import { SortableEdge } from "../../ui/sortableList/useSortableList";
import { StepPreview } from "../common/StepPreview";
import { CountdownStep } from "./CountdownStep";

type Props = {
  step: CountdownStep;
  elevated?: boolean;
  edgeAction?: SortableEdge | null;
};

export const CountdownPreview = ({ step, elevated, edgeAction }: Props) => (
  <StepPreview icon={<TimerIcon />} elevated={elevated} edgeAction={edgeAction}>
    {step.title} ({step.duration}s)
  </StepPreview>
);
