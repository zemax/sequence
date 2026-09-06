import { ReactNode } from "react";
import { SortableEntry, SortableListOptions, useSortableList } from "./useSortableList";
import { SortableDropIndicator } from "./SortableDropIndicator";

type Props<T> = SortableListOptions & {
  items: T[];
  getId: (item: T) => string;
  onReorder: (id: string, toIndex: number) => void;
  className?: string;
  children: (item: T, entry: SortableEntry) => ReactNode;
};

// A reorderable <ul> — pair with SortableItem for each <li>. See docs/drag-reorder.md.
export const SortableList = <T,>({ items, getId, onReorder, paddingX, paddingY, className, children }: Props<T>) => {
  const sortable = useSortableList(items, getId, onReorder, { paddingX, paddingY });

  return (
    <ul className={className}>
      {items.map((item, index) => children(item, sortable.getItemProps(item, index)))}
      <li>
        <SortableDropIndicator active={sortable.showTrailingDropIndicator} />
      </li>
    </ul>
  );
};
