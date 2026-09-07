import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import { getUI } from "../../data/informations";

import components from "../../styles/Components.module.scss";

type Props = {
  onClick: () => void;
};

export const PreviousButton = ({ onClick }: Props) => {
  const { previous } = getUI();

  return (
    <button type="button" className={components.round} onClick={onClick} aria-label={previous}>
      <SkipPreviousIcon />
    </button>
  );
};
