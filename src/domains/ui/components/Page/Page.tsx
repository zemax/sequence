import { FunctionComponent, PropsWithChildren } from "react";
import classNames from "classnames";
import { BackButton } from "../Back/Back";

import styles from "./Page.module.scss";

type Props = PropsWithChildren<Record<never, any>> & {
  back?: boolean;
  floating?: boolean;
  fullscreen?: boolean;
};

export const Page: FunctionComponent<Props> = ({ children, back, floating, fullscreen }) => {
  return (
    <div className={classNames(styles.page, fullscreen && styles.pageFullscreen)}>
      <main className={classNames(styles.main, floating && styles.mainWithFloating)}>
        {back && (
          <div className={styles.header}>
            <BackButton />
          </div>
        )}
        {children}
      </main>
    </div>
  );
};
