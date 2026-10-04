import { ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { SortableEntry, SortableListOptions, useSortableList } from "./useSortableList";
import { DeleteZone } from "./DeleteZone";
import { SortableDropIndicator } from "./SortableDropIndicator";

type Props<T> = Omit<SortableListOptions<T>, "deleteZoneRef"> & {
  items: T[];
  getId: (item: T) => string;
  onReorder: (id: string, toIndex: number) => void;
  className?: string;
  children: (item: T, entry: SortableEntry) => ReactNode;
};

// A reorderable <ul> — pair with SortableItem for each <li>. See docs/drag-reorder.md.
export const SortableList = <T,>({
  items,
  getId,
  onReorder,
  paddingX,
  paddingY,
  onDelete,
  holdId,
  isDropTarget,
  onDropInto,
  containerRef,
  onEscapeContainer,
  onEscapePointer,
  externalDropIndex,
  incomingRef,
  className,
  children,
}: Props<T>) => {
  const deleteZoneRef = useRef<HTMLDivElement>(null);
  const sortable = useSortableList(items, getId, onReorder, {
    paddingX,
    paddingY,
    deleteZoneRef: onDelete ? deleteZoneRef : undefined,
    onDelete,
    holdId,
    isDropTarget,
    onDropInto,
    containerRef,
    onEscapeContainer,
    onEscapePointer,
    externalDropIndex,
    incomingRef,
  });

  useEffect(() => {
    document.body.toggleAttribute("data-dragging", sortable.dragging);
    return () => document.body.removeAttribute("data-dragging");
  }, [sortable.dragging]);

  return (
    <>
      <ul className={className}>
        {items.map((item, index) => children(item, sortable.getItemProps(item, index)))}
        <li>
          <SortableDropIndicator active={sortable.showTrailingDropIndicator} />
        </li>
      </ul>
      {onDelete &&
        createPortal(<DeleteZone zoneRef={deleteZoneRef} visible={sortable.dragging} over={sortable.overDeleteZone} />, document.body)}
    </>
  );
};
