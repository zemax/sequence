"use client";

import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { selectSequence } from "../../../data/sequences/sequencesSlice";
import { SequenceEdit } from "../../../domains/sequence/SequenceEdit";
import { Page } from "../../../domains/ui/components/Page/Page";

export const SequenceEditClientPage = () => {
  const id = useSearchParams().get("id") ?? "";
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
