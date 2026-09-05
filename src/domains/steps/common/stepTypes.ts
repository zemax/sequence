import { Step } from "../../../data/sequences/sequencesSlice";
import { getUI } from "../../../data/informations";

export const stepTypes: Step["type"][] = ["countdown", "pause"];

export const stepTypeOptionLabel = (type: Step["type"]) => {
  const { stepTypeCountdownLabel, stepTypePauseLabel } = getUI();
  return type === "countdown" ? stepTypeCountdownLabel : stepTypePauseLabel;
};
