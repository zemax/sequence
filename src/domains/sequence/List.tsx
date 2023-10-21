import { useSelector } from "react-redux";
import { selectSequences } from "../../data/sequences/sequencesSlice";
import { ListItem } from "./ListItem";

import styles from "./Sequence.module.scss";

export const List = () => {
  const sequences = useSelector(selectSequences);

  return (
    <ul className={styles.list}>
      {sequences.map((sequence) => (
        <ListItem key={sequence.id} sequence={sequence} />
      ))}
    </ul>
  );
};
