import { SequenceCreate } from "../../../domains/sequence/SequenceCreate";
import { Page } from "../../../domains/ui/components/Page/Page";

export default function CreateSequencePage() {
  return (
    <Page back>
      <SequenceCreate />
    </Page>
  );
}
