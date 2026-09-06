import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { FunctionComponent } from "react";
import classNames from "classnames";
import { getUI } from "../../../../data/informations";
import components from "/src/styles/Components.module.scss";

export const BackButton: FunctionComponent = () => {
  const { back } = getUI();

  return (
    <Link href="/" className={classNames(components.round, components.floating, components.floatingTopLeft)} aria-label={back}>
      <ArrowBackIcon />
    </Link>
  );
};
