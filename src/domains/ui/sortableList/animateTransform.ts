export const REORDER_TRANSITION_MS = 250;

export const animateTransform = (element: HTMLElement, fromTransform: string) => {
  element.style.transition = "none";
  element.style.transform = fromTransform;
  element.getBoundingClientRect();
  element.style.transition = `transform ${REORDER_TRANSITION_MS}ms ease`;
  element.style.transform = "";
};
