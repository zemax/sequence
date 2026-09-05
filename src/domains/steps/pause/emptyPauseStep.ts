import { PauseStep } from "./PauseStep";
import { getUI } from "../../../data/informations";

export const emptyPauseStep = (): PauseStep => ({
  id: (typeof window !== "undefined" && window.crypto.randomUUID()) || "",
  type: "pause",
  title: getUI().pauseDefaultTitle,
});
