import { Suspense } from "react";
import { SequenceEditClientPage } from "./SequenceEditClientPage";

export default function SequenceEditPage() {
  return (
    <Suspense>
      <SequenceEditClientPage />
    </Suspense>
  );
}
