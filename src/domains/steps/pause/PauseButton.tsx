import PauseIcon from "@mui/icons-material/Pause";
import { getUI } from "../../../data/informations";

import components from "../../../styles/Components.module.scss";

type Props = {
  onClick: () => void;
};

export const PauseButton = ({ onClick }: Props) => {
  const { stepTypePauseLabel } = getUI();

  return (
    <button type="button" className={components.round} onClick={onClick} aria-label={stepTypePauseLabel}>
      <PauseIcon />
    </button>
  );
};
