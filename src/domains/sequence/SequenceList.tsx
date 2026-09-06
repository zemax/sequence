"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import classNames from "classnames";
import { useSelector } from "react-redux";
import { moveSequence, removeSequence, selectSequences } from "../../data/sequences/sequencesSlice";
import store from "../../data/store";
import { SortableList } from "../ui/sortableList/SortableList";
import { SortableItem } from "../ui/sortableList/SortableItem";
import { SequencePreview } from "./SequencePreview";

import styles from "./Sequence.module.scss";

const DELETE_EDGE_THRESHOLD_PX = 50;

export const SequenceList = () => {
  const sequences = useSelector(selectSequences);

  return (
    <SortableList
      items={sequences}
      getId={(sequence) => sequence.id}
      onReorder={(id, toIndex) => store.dispatch(moveSequence({ id, toIndex }))}
      edgeActionThreshold={DELETE_EDGE_THRESHOLD_PX}
      onEdgeAction={(id, edge) => {
        if (edge !== "right") {
          return false;
        }
        store.dispatch(removeSequence({ id }));
        return true;
      }}
      paddingX={8}
      paddingY={8}
      className={styles.list}
    >
      {(sequence, entry) => (
        <SortableItem key={sequence.id} entry={entry} className={styles.card} draggingClassName={styles.cardDragging}>
          <SequencePreview sequence={sequence} />
          <div className={classNames(styles.deleteOverlay, entry.edgeAction === "right" && styles.deleteOverlayVisible)}>
            <DeleteIcon />
          </div>
        </SortableItem>
      )}
    </SortableList>
  );
};
