import { useParams } from "react-router";
import { useSelector } from "react-redux";
import { selectSequence } from "../data/sequences/sequencesSlice";
import { SequenceEdit } from "../domains/sequence/SequenceEdit";
import { Page } from "../domains/ui/components/Page/Page";

export const SequenceEditPage = () => {
  const { id = "" } = useParams();
  const sequence = useSelector(selectSequence(id));

  if (!sequence) {
    return null;
  }

  return (
    <Page back>
      <SequenceEdit sequence={sequence} />
    </Page>
  );
};
