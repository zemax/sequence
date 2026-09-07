import { Link } from "react-router";
import { ComponentProps } from "react";

// Use instead of react-router's Link inside a sortable row — Firefox otherwise starts its own
// native drag on a mousedown-and-move over a plain <a>, hijacking the gesture.
export const NoDragLink = (props: ComponentProps<typeof Link>) => (
  <Link {...props} draggable={false} onDragStart={(e) => e.preventDefault()} />
);
