import { FunctionComponent, PropsWithChildren } from "react";
import { Header } from "../Header/Header";

import styles from "./Page.module.scss";

type Props = PropsWithChildren<Record<never, any>> & {
  title?: string;
  back?: boolean;
};

export const Page: FunctionComponent<Props> = ({ children, title, back }) => {
  return (
    <div className={styles.page}>
      <Header title={title} back={back} />
      <main className={styles.main}>{children}</main>
    </div>
  );
};
