import { List } from "../domains/sequence/List";
import { Page } from "../domains/ui/components/Page/Page";
import { CreateButton } from "../domains/sequence/CreateButton";

export default function HomePage() {
  return (
    <Page>
      <List />
      <CreateButton />
    </Page>
  );
}
