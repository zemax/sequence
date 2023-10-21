import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { FunctionComponent } from "react";
import { getUI } from "../../../../data/informations";
import components from "/src/styles/Components.module.scss";

export const BackButton: FunctionComponent = (props) => {
  const { back } = getUI();

  return (
    <Link href={`/`} {...props}>
      <a className={components.icon}>
        <ArrowBackIcon />
      </a>
    </Link>
  );
};
