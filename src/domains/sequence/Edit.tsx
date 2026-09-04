import { FunctionComponent, PropsWithChildren } from "react";
import { Sequence } from "../../data/sequences/sequencesSlice";
import { Form } from "./Form";

type Props = PropsWithChildren<Record<never, any>> & {
  sequence?: Sequence;
};

export const Edit: FunctionComponent<Props> = ({ sequence }) => {
  if (!sequence) {
    return null;
  }

  return (
      <Form sequence={sequence} />
  );
};
