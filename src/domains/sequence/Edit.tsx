import { FunctionComponent, PropsWithChildren } from "react";
import { Sequence } from "../../data/sequences/sequencesSlice";

type Props = PropsWithChildren<Record<never, any>> & {
  sequence?: Sequence;
};

export const Edit: FunctionComponent<Props> = ({ sequence }) => {
  if (!sequence) {
    return null;
  }

  return (
    <>
      <h1>Edit</h1>
    </>
  );
};
