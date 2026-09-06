import { ReactNode } from "react";
import classNames from "classnames";
import { SortableEntry } from "./useSortableList";
import { SortableDropIndicator } from "./SortableDropIndicator";

type Props = {
  entry: SortableEntry;
  className?: string;
  draggingClassName?: string;
  children: ReactNode;
};

// One reorderable <li> — see docs/drag-reorder.md.
export const SortableItem = ({ entry, className, draggingClassName, children }: Props) => {
  const { rowProps, itemProps, isDragging, showDropIndicatorBefore } = entry;

  return (
    <li {...rowProps}>
      <SortableDropIndicator active={showDropIndicatorBefore} />
      <div {...itemProps} className={classNames(className, itemProps.className, isDragging && draggingClassName)}>
        {children}
      </div>
    </li>
  );
};
