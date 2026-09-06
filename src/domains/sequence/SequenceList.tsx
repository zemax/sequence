"use client";

import { useSelector } from "react-redux";
import { selectSequences } from "../../data/sequences/sequencesSlice";
import { SequencePreview } from "./SequencePreview";

import styles from "./Sequence.module.scss";

export const SequenceList = () => {
  const sequences = useSelector(selectSequences);

  return (
    <ul className={styles.list}>
      {sequences.map((sequence) => (
        <li key={sequence.id} className={styles.listItem}>
          <SequencePreview sequence={sequence} />
        </li>
      ))}
    </ul>
  );
};
