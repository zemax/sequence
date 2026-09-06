import AddIcon from "@mui/icons-material/Add";
import Link from "next/link";

import components from "../../styles/Components.module.scss";

export const SequenceCreateButton = () => (
  <Link href="/sequence/create" className={components.floating}>
    <AddIcon />
  </Link>
);
