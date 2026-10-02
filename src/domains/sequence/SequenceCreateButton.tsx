import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router";
import classNames from "classnames";
import { getUI } from "../../data/informations";

import components from "../../styles/Components.module.scss";

export const SequenceCreateButton = () => {
  const { newSequence } = getUI();

  return (
    <Link to="/sequence/create" className={classNames(components.extended, components.floating, components.floatingBottomRight)}>
      <AddIcon />
      <span>{newSequence}</span>
    </Link>
  );
};
