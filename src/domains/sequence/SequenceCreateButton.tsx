import AddIcon from "@mui/icons-material/Add";
import Link from "next/link";
import classNames from "classnames";

import components from "../../styles/Components.module.scss";

export const SequenceCreateButton = () => (
  <Link href="/sequence/create" className={classNames(components.round, components.floating, components.floatingBottomRight)}>
    <AddIcon />
  </Link>
);
