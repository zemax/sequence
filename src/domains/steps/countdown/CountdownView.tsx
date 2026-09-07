import { useEffect, useState } from "react";
import { CountdownStep } from "./CountdownStep";

type Props = {
  step: CountdownStep;
  onDone: () => void;
};

export const CountdownView = ({ step, onDone }: Props) => {
  const [remaining, setRemaining] = useState(step.duration);

  useEffect(() => {
    setRemaining(step.duration);
  }, [step]);

  useEffect(() => {
    if (remaining <= 0) {
      onDone();
      return;
    }
    const timeout = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(timeout);
  }, [remaining, onDone]);

  return (
    <>
      <h1>{step.title}</h1>
      <p>{remaining}</p>
    </>
  );
};
