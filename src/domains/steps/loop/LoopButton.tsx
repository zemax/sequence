import LoopIcon from "@mui/icons-material/Loop";
import { getUI } from "../../../data/informations";

import components from "../../../styles/Components.module.scss";

type Props = {
  onClick: () => void;
};

export const LoopButton = ({ onClick }: Props) => {
  const { stepTypeLoopLabel } = getUI();

  return (
    <button type="button" className={components.round} onClick={onClick} aria-label={stepTypeLoopLabel}>
      <LoopIcon />
    </button>
  );
};
