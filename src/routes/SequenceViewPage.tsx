import { useParams } from "react-router";
import { useSelector } from "react-redux";
import { selectSequence } from "../data/sequences/sequencesSlice";
import { SequenceView } from "../domains/sequence/SequenceView";
import { Page } from "../domains/ui/components/Page/Page";

export const SequenceViewPage = () => {
  const { id = "" } = useParams();
  const sequence = useSelector(selectSequence(id));

  if (!sequence) {
    return null;
  }

  return (
    <Page>
      <SequenceView sequence={sequence} />
    </Page>
  );
};
