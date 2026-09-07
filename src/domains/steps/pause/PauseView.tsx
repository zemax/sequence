import { PauseStep } from "./PauseStep";

type Props = {
  step: PauseStep;
  onDone: () => void;
};

export const PauseView = ({ step, onDone }: Props) => (
  <button type="button" onClick={onDone}>
    <h1>{step.title}</h1>
  </button>
);
