import { Step } from "../../../data/sequences/sequencesSlice";
import { CountdownView } from "../countdown/CountdownView";
import { PauseView } from "../pause/PauseView";

type Props = {
  step: Step;
  paused: boolean;
  onDone: () => void;
};

export const StepView = ({ step, paused, onDone }: Props) => {
  switch (step.type) {
    case "countdown":
      return <CountdownView step={step} paused={paused} onDone={onDone} />;
    case "pause":
      return <PauseView step={step} onDone={onDone} />;
  }
};
