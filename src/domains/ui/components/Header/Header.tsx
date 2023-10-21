import { FunctionComponent, PropsWithChildren } from "react";
import { getUI } from "../../../../data/informations";
import { BackButton } from "../Back/Back";
import styles from "./Header.module.scss";

type Props = PropsWithChildren<Record<never, any>> & {
  title?: string;
  back?: boolean;
};

export const Header: FunctionComponent<Props> = ({ title, back }) => {
  const { title: defaultTitle } = getUI();

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title || defaultTitle}</h1>
      {back && (
        <div className={styles.back}>
          <BackButton />
        </div>
      )}
    </header>
  );
};
