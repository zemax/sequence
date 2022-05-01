import Link from "next/link";
import { useSelector } from "react-redux";
import { getUI } from "../../data/informations";
import { selectSequence } from "../../data/sequences/sequencesSlice";

export const View = ({ id }) => {
  const sequence = useSelector(selectSequence(id));
  const { back } = getUI();

  return (
    <>
      <Link href={`/`}>{back}</Link>
      <h1>{sequence.name}</h1>
    </>
  );
};
