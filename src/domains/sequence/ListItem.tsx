import Link from "next/link";
import EditIcon from "@mui/icons-material/Edit";

import components from "../../styles/Components.module.scss";
import styles from "./Sequence.module.scss";

export const ListItem = ({ sequence }) => {
  return (
    <li className={styles.listItem}>
      <Link href={`/sequence/${sequence.id}`}>
        <a className={styles.listItemTitle}>{sequence.name}</a>
      </Link>
      <Link href={`/sequence/${sequence.id}/edit`}>
        <a className={components.icon}>
          <EditIcon />
        </a>
      </Link>
    </li>
  );
};
