import React from "react";
import { List } from "../domains/sequence/List";
import { Page } from "../domains/ui/components/Page/Page";
import { CreateButton } from "../domains/sequence/CreateButton";

export default () => (
  <Page>
    <List />
    <CreateButton />
  </Page>
);
