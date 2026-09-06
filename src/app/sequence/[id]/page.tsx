"use client";

import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { selectSequence } from "../../../data/sequences/sequencesSlice";
import { SequenceView } from "../../../domains/sequence/SequenceView";
import { Page } from "../../../domains/ui/components/Page/Page";

export default function SequencePage() {
  const { id } = useParams<{ id: string }>();
  const sequence = useSelector(selectSequence(id));

  if (!sequence) {
    return null;
  }

  return (
    <Page back>
      <SequenceView sequence={sequence} />
    </Page>
  );
}
