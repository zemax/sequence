import { SequenceList } from "../domains/sequence/SequenceList";
import { Page } from "../domains/ui/components/Page/Page";
import { SequenceCreateButton } from "../domains/sequence/SequenceCreateButton";

export default function HomePage() {
  return (
    <Page>
      <SequenceList />
      <SequenceCreateButton />
    </Page>
  );
}
