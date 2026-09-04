import SaveIcon from "@mui/icons-material/Save";
import { useState } from "react";
import { getUI } from "../../data/informations";
import { Sequence, addSequence, emptySequence, updateSequence } from "../../data/sequences/sequencesSlice";
import store from "../../data/store";
import { useRouter } from "next/router";

export const Form = ({ sequence: initialSequence }: { sequence?: Sequence }) => {
  const [sequence, setSequence] = useState(initialSequence || emptySequence());
  const router = useRouter();
  const { nameLabel } = getUI();

  const save = () => {
    initialSequence ? store.dispatch(updateSequence(sequence)) : store.dispatch(addSequence(sequence));
    router.push("/");
  };

  return (
    <>
      <label>{nameLabel}</label>
      <input type="text" value={sequence.name} onChange={(e) => setSequence({ ...sequence, name: e.target.value })} />
      <button type="button" onClick={save}>
        <SaveIcon />
      </button>
    </>
  );
};
