import { Suspense } from "react";
import { SequenceViewClientPage } from "./SequenceViewClientPage";

export default function SequenceViewPage() {
  return (
    <Suspense>
      <SequenceViewClientPage />
    </Suspense>
  );
}
