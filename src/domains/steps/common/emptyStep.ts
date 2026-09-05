import { Step } from "../../../data/sequences/sequencesSlice";
import { emptyCountdownStep } from "../countdown/emptyCountdownStep";
import { emptyPauseStep } from "../pause/emptyPauseStep";

export const emptyStep = (type: Step["type"]): Step => (type === "countdown" ? emptyCountdownStep() : emptyPauseStep());
