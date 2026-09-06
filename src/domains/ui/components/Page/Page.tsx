import { FunctionComponent, PropsWithChildren } from "react";
import classNames from "classnames";
import { BackButton } from "../Back/Back";

import styles from "./Page.module.scss";

type Props = PropsWithChildren<Record<never, any>> & {
  back?: boolean;
};

export const Page: FunctionComponent<Props> = ({ children, back }) => {
  return (
    <div className={styles.page}>
      {back && <BackButton />}
      <main className={classNames(styles.main, back && styles.mainWithBack)}>{children}</main>
    </div>
  );
};
