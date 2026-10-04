import { useState } from "react";
import { useSelector } from "react-redux";
import { moveSequence, removeSequence, selectSequences } from "../../data/sequences/sequencesSlice";
import { getUI } from "../../data/informations";
import store from "../../data/store";
import { ConfirmDialog } from "../ui/components/ConfirmDialog/ConfirmDialog";
import { SortableList } from "../ui/sortableList/SortableList";
import { SortableItem } from "../ui/sortableList/SortableItem";
import { SequencePreview } from "./SequencePreview";

import styles from "./Sequence.module.scss";

export const SequenceList = () => {
  const { confirmDeleteTitle } = getUI();
  const sequences = useSelector(selectSequences);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  return (
    <>
      <SortableList
        items={sequences}
        getId={(sequence) => sequence.id}
        onReorder={(id, toIndex) => store.dispatch(moveSequence({ id, toIndex }))}
        holdId={pendingDeleteId}
        onDelete={(id) => {
          setPendingDeleteId(id);
          return "hold";
        }}
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

      {pendingDeleteId && (
        <ConfirmDialog
          title={confirmDeleteTitle}
          onCancel={() => setPendingDeleteId(null)}
          onConfirm={() => {
            store.dispatch(removeSequence({ id: pendingDeleteId }));
            setPendingDeleteId(null);
          }}
        />
      )}
    </>
  );
};
