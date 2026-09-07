import { SequenceCreateButton } from "../domains/sequence/SequenceCreateButton";
import { SequenceList } from "../domains/sequence/SequenceList";
import { SettingsButton } from "../domains/settings/SettingsButton";
import { Page } from "../domains/ui/components/Page/Page";

export const HomePage = () => (
  <Page>
    <SequenceList />
    <SequenceCreateButton />
    <SettingsButton />
  </Page>
);
