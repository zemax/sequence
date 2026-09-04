import { Create } from "../../../domains/sequence/Create";
import { Page } from "../../../domains/ui/components/Page/Page";

export default function CreateSequencePage() {
  return (
    <Page back>
      <Create />
    </Page>
  );
}
