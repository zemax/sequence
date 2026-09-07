import SkipNextIcon from "@mui/icons-material/SkipNext";
import { getUI } from "../../data/informations";

import components from "../../styles/Components.module.scss";

type Props = {
  onClick: () => void;
};

export const NextButton = ({ onClick }: Props) => {
  const { next } = getUI();

  return (
    <button type="button" className={components.round} onClick={onClick} aria-label={next}>
      <SkipNextIcon />
    </button>
  );
};
