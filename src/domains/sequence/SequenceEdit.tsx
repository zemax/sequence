import { FunctionComponent, PropsWithChildren } from "react";
import { Sequence } from "../../data/sequences/sequencesSlice";
import { SequenceForm } from "./SequenceForm";

type Props = PropsWithChildren<Record<never, any>> & {
  sequence?: Sequence;
};

export const SequenceEdit: FunctionComponent<Props> = ({ sequence }) => {
  if (!sequence) {
    return null;
  }

  return (
      <SequenceForm sequence={sequence} />
  );
};
