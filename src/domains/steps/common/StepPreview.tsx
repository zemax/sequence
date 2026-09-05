import { Step } from "../../../data/sequences/sequencesSlice";
import { CountdownPreview } from "../countdown/CountdownPreview";
import { PausePreview } from "../pause/PausePreview";

export const StepPreview = ({ step }: { step: Step }) => {
  switch (step.type) {
    case "countdown":
      return <CountdownPreview step={step} />;
    case "pause":
      return <PausePreview step={step} />;
  }
};
