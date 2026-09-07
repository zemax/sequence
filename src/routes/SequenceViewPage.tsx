import { useSearchParams } from "react-router";
import { useSelector } from "react-redux";
import { selectSequence } from "../data/sequences/sequencesSlice";
import { SequenceView } from "../domains/sequence/SequenceView";
import { Page } from "../domains/ui/components/Page/Page";

export const SequenceViewPage = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const sequence = useSelector(selectSequence(id));

  if (!sequence) {
    return null;
  }

  return (
    <Page back>
      <SequenceView sequence={sequence} />
    </Page>
  );
};
