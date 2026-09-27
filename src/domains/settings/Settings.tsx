import { ChangeEvent, useRef } from "react";
import { useSelector } from "react-redux";
import { getUI } from "../../data/informations";
import { Sequence, resetSequences, selectSequences, setSequences } from "../../data/sequences/sequencesSlice";
import { selectSoundMuted, setSoundMuted } from "../../data/settings/settingsSlice";
import store from "../../data/store";

import styles from "./Settings.module.scss";

export const Settings = () => {
  const {
    settings,
    settingsMuteSounds,
    settingsExport,
    settingsImport,
    settingsImportConfirm,
    settingsImportInvalid,
    settingsReset,
    settingsResetConfirm,
  } = getUI();
  const sequences = useSelector(selectSequences);
  const soundMuted = useSelector(selectSoundMuted);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(sequences, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sequences.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) {
      return;
    }

    try {
      const imported = JSON.parse(await file.text());
      if (!Array.isArray(imported)) {
        throw new Error("Imported file is not a sequence array");
      }
      if (window.confirm(settingsImportConfirm)) {
        store.dispatch(setSequences(imported as Sequence[]));
      }
    } catch {
      window.alert(settingsImportInvalid);
    }
  };

  const handleReset = () => {
    if (window.confirm(settingsResetConfirm)) {
      store.dispatch(resetSequences());
    }
  };

  return (
    <>
      <h1>{settings}</h1>

      <div className={styles.actions}>
        <label className="checkbox--inside">
          <input type="checkbox" checked={soundMuted} onChange={(e) => store.dispatch(setSoundMuted(e.target.checked))} />
          <span>{settingsMuteSounds}</span>
        </label>

        <button type="button" className={styles.button} onClick={handleExport}>
          {settingsExport}
        </button>

        <button type="button" className={styles.button} onClick={() => fileInputRef.current?.click()}>
          {settingsImport}
        </button>
        <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={handleImportChange} />

        <button type="button" className={styles.danger} onClick={handleReset}>
          {settingsReset}
        </button>
      </div>
    </>
  );
};
