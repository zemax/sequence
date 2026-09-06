import { EditSequenceClientPage } from "./EditSequenceClientPage";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function EditSequencePage() {
  return <EditSequenceClientPage />;
}
