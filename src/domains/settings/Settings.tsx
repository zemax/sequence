import DownloadIcon from "@mui/icons-material/Download";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import UploadIcon from "@mui/icons-material/Upload";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import classNames from "classnames";
import { ChangeEvent, useRef } from "react";
import { useSelector } from "react-redux";
import { getUI } from "../../data/informations";
import { Sequence, resetSequences, selectSequences, setSequences } from "../../data/sequences/sequencesSlice";
import { SOUND_LEVEL_COUNT, selectSoundLevel, selectSoundMuted, setSoundLevel, setSoundMuted } from "../../data/settings/settingsSlice";
import store from "../../data/store";
import { SoundLevelSlider } from "./SoundLevelSlider";

import styles from "./Settings.module.scss";

export const Settings = () => {
  const {
    settings,
    settingsSoundsTitle,
    settingsDataTitle,
    settingsPlaySounds,
    settingsSoundLevel,
    settingsExport,
    settingsImport,
    settingsImportConfirm,
    settingsImportInvalid,
    settingsReset,
    settingsResetConfirm,
  } = getUI();
  const sequences = useSelector(selectSequences);
  const soundMuted = useSelector(selectSoundMuted);
  const soundLevel = useSelector(selectSoundLevel);
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

      <section className={styles.group}>
        <h2 className={styles.groupTitle}>{settingsSoundsTitle}</h2>
        <div className={styles.card}>
          <label className={styles.row}>
            <span className={styles.icon}>
              {soundMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </span>
            <span className={styles.label}>{settingsPlaySounds}</span>
            <input
              type="checkbox"
              role="switch"
              className={styles.switch}
              checked={!soundMuted}
              onChange={(e) => store.dispatch(setSoundMuted(!e.target.checked))}
            />
          </label>

          <div className={styles.sliderRow}>
            <div className={styles.sliderHeader}>
              <span className={styles.icon}>
                <GraphicEqIcon />
              </span>
              <span className={styles.label}>{settingsSoundLevel}</span>
            </div>
            <SoundLevelSlider
              value={soundLevel}
              count={SOUND_LEVEL_COUNT}
              label={settingsSoundLevel}
              disabled={soundMuted}
              onChange={(level) => store.dispatch(setSoundLevel(level))}
            />
          </div>
        </div>
      </section>

      <section className={styles.group}>
        <h2 className={styles.groupTitle}>{settingsDataTitle}</h2>
        <div className={styles.card}>
          <button type="button" className={styles.row} onClick={handleExport}>
            <span className={styles.icon}>
              <DownloadIcon />
            </span>
            <span className={styles.label}>{settingsExport}</span>
          </button>

          <button type="button" className={styles.row} onClick={() => fileInputRef.current?.click()}>
            <span className={styles.icon}>
              <UploadIcon />
            </span>
            <span className={styles.label}>{settingsImport}</span>
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={handleImportChange} />
        </div>
      </section>

      <section className={styles.group}>
        <div className={styles.card}>
          <button type="button" className={classNames(styles.row, styles.danger)} onClick={handleReset}>
            <span className={styles.icon}>
              <RestartAltIcon />
            </span>
            <span className={styles.label}>{settingsReset}</span>
          </button>
        </div>
      </section>
    </>
  );
};
