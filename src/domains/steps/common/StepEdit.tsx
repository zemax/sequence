import { Step } from "../../../data/sequences/sequencesSlice";
import { CountdownEdit } from "../countdown/CountdownEdit";
import { PauseEdit } from "../pause/PauseEdit";

export const StepEdit = ({ step, onChange }: { step: Step; onChange: (step: Step) => void }) => {
  switch (step.type) {
    case "countdown":
      return <CountdownEdit step={step} onChange={onChange} />;
    case "pause":
      return <PauseEdit step={step} onChange={onChange} />;
  }
};
