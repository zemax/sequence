import TimerIcon from "@mui/icons-material/TimerOutlined";
import { getUI } from "../../../data/informations";

import components from "../../../styles/Components.module.scss";

type Props = {
  onClick: () => void;
};

export const CountdownButton = ({ onClick }: Props) => {
  const { stepTypeCountdownLabel } = getUI();

  return (
    <button type="button" className={components.round} onClick={onClick} aria-label={stepTypeCountdownLabel}>
      <TimerIcon />
    </button>
  );
};
