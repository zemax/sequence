import Link from "next/link";
import React from "react";
import { useSelector } from "react-redux";
import { selectSequences } from "../../data/sequences/sequencesSlice";

export const List = () => {
  const sequences = useSelector(selectSequences);

  return (
    <ul>
      {sequences.map((sequence) => (
        <li key={sequence.id}>
          <Link href={`/sequence/${sequence.id}`}>
            <a>{sequence.name}</a>
          </Link>
        </li>
      ))}
    </ul>
  );
};
