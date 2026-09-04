"use client";

import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { selectSequence } from "../../../../data/sequences/sequencesSlice";
import { Edit } from "../../../../domains/sequence/Edit";
import { Page } from "../../../../domains/ui/components/Page/Page";

export default function EditSequencePage() {
  const { id } = useParams<{ id: string }>();
  const sequence = useSelector(selectSequence(id));

  if (!sequence) {
    return null;
  }

  return (
    <Page title={sequence.name} back>
      <Edit sequence={sequence} />
    </Page>
  );
}
