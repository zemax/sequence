import { CountdownStep } from "./CountdownStep";

export const CountdownPreview = ({ step }: { step: CountdownStep }) => (
  <>
    {step.title} ({step.duration}s)
  </>
);
