import { SequenceCreate } from "../domains/sequence/SequenceCreate";
import { Page } from "../domains/ui/components/Page/Page";

export const SequenceCreatePage = () => (
  <Page back>
    <SequenceCreate />
  </Page>
);
