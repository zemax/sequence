import SettingsIcon from "@mui/icons-material/Settings";
import { Link } from "react-router";
import classNames from "classnames";
import { getUI } from "../../data/informations";

import components from "../../styles/Components.module.scss";

export const SettingsButton = () => {
  const { settings } = getUI();

  return (
    <Link to="/settings" className={classNames(components.round, components.floating, components.floatingBottomLeft)} aria-label={settings}>
      <SettingsIcon />
    </Link>
  );
};
