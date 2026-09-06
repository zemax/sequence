"use client";

import { useSelector } from "react-redux";
import { moveSequence, selectSequences } from "../../data/sequences/sequencesSlice";
import store from "../../data/store";
import { SortableList } from "../ui/sortableList/SortableList";
import { SortableItem } from "../ui/sortableList/SortableItem";
import { SequencePreview } from "./SequencePreview";

import styles from "./Sequence.module.scss";

export const SequenceList = () => {
  const sequences = useSelector(selectSequences);

  return (
    <SortableList
      items={sequences}
      getId={(sequence) => sequence.id}
      onReorder={(id, toIndex) => store.dispatch(moveSequence({ id, toIndex }))}
      paddingX={8}
      paddingY={8}
      className={styles.list}
    >
      {(sequence, entry) => (
        <SortableItem key={sequence.id} entry={entry} className={styles.card} draggingClassName={styles.cardDragging}>
          <SequencePreview sequence={sequence} />
        </SortableItem>
      )}
    </SortableList>
  );
};
