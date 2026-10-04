import PauseIcon from "@mui/icons-material/Pause";
import { StepPreview } from "../common/StepPreview";
import { PauseStep } from "./PauseStep";

type Props = {
  step: PauseStep;
  elevated?: boolean;
  onClick?: () => void;
};

export const PausePreview = ({ step, elevated, onClick }: Props) => (
  <StepPreview icon={<PauseIcon />} elevated={elevated} onClick={onClick}>
    {step.title}
  </StepPreview>
);
