import { SequenceClientPage } from "./SequenceClientPage";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function SequencePage() {
  return <SequenceClientPage />;
}
