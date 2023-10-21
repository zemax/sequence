import AddIcon from "@mui/icons-material/Add";
import Link from "next/link";

import components from "../../styles/Components.module.scss";

export const CreateButton = () => (
  <Link href={`/sequence/create`}>
    <a className={components.floating}>
      <AddIcon />
    </a>
  </Link>
);
