import { CountdownStep } from "./CountdownStep";
import { getUI } from "../../../data/informations";

export const emptyCountdownStep = (): CountdownStep => ({
  id: (typeof window !== "undefined" && window.crypto.randomUUID()) || "",
  type: "countdown",
  title: getUI().countdownDefaultTitle,
  duration: 30,
});
