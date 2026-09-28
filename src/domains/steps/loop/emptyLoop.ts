import { Loop } from "../../../data/sequences/sequencesSlice";

export const emptyLoop = (): Loop => ({
  id: (typeof window !== "undefined" && window.crypto.randomUUID()) || "",
  type: "loop",
  steps: [],
  repeatCount: 2,
});
