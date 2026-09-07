import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link } from "react-router";
import { FunctionComponent } from "react";
import classNames from "classnames";
import { getUI } from "../../../../data/informations";
import components from "../../../../styles/Components.module.scss";

export const BackButton: FunctionComponent = () => {
  const { back } = getUI();

  return (
    <Link to="/" className={classNames(components.round, components.floating, components.floatingBottomLeft)} aria-label={back}>
      <ArrowBackIcon />
    </Link>
  );
};
