import { Step } from "../../../data/sequences/sequencesSlice";
import { CountdownView } from "../countdown/CountdownView";
import { PauseView } from "../pause/PauseView";

export const StepView = ({ step, onDone }: { step: Step; onDone: () => void }) => {
  switch (step.type) {
    case "countdown":
      return <CountdownView step={step} onDone={onDone} />;
    case "pause":
      return <PauseView step={step} onDone={onDone} />;
  }
};
