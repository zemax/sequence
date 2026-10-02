import { getUI } from "../data/informations";
import { SequenceCreateButton } from "../domains/sequence/SequenceCreateButton";
import { SequenceList } from "../domains/sequence/SequenceList";
import { SettingsButton } from "../domains/settings/SettingsButton";
import { Page } from "../domains/ui/components/Page/Page";

import styles from "../domains/sequence/Sequence.module.scss";

export const HomePage = () => {
  const { sequences } = getUI();

  return (
    <Page floating>
      <header className={styles.homeHeader}>
        <h1>{sequences}</h1>
        <SettingsButton />
      </header>
      <SequenceList />
      <SequenceCreateButton />
    </Page>
  );
};
