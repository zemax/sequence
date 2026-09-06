import Link from "next/link";
import EditIcon from "@mui/icons-material/Edit";

import components from "../../styles/Components.module.scss";
import styles from "./Sequence.module.scss";

export const SequencePreview = ({ sequence }) => (
  <>
    <Link href={`/sequence/${sequence.id}`} className={styles.listItemTitle}>
      {sequence.name}
    </Link>
    <Link href={`/sequence/${sequence.id}/edit`} className={components.icon}>
      <EditIcon />
    </Link>
  </>
);
