import { getUI } from "../../../data/informations";

export const durationLabel = (duration: number | undefined): string => {
  if (duration === undefined) {
    return "";
  }

  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  return getUI().durationLabel(minutes, seconds);
};
