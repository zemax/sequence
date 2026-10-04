import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { getUI } from "../../../../data/informations";

import components from "../../../../styles/Components.module.scss";
import styles from "./ConfirmDialog.module.scss";

const FADE_MS = 120;

type Props = {
  title: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDialog = ({ title, message, onConfirm, onCancel }: Props) => {
  const { cancel, confirm } = getUI();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [closing, setClosing] = useState(false);

  // The caller unmounts the dialog from its callbacks, so they wait for the fade-out to finish.
  const close = (callback: () => void) => {
    if (closing) {
      return;
    }
    setClosing(true);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(callback, reducedMotion ? 0 : FADE_MS);
  };

  useEffect(() => {
    cancelRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close(onCancel);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });

  return (
    <div className={classNames(styles.backdrop, closing && styles.closing)} onClick={(e) => e.target === e.currentTarget && close(onCancel)}>
      <div className={styles.dialog} role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
        <h2 id="confirm-dialog-title" className={styles.title}>
          {title}
        </h2>
        {message && <p className={styles.message}>{message}</p>}
        <div className={styles.buttons}>
          <button ref={cancelRef} type="button" className={components.ghostLarge} onClick={() => close(onCancel)} aria-label={cancel}>
            <CloseIcon />
          </button>
          <button type="button" className={components.action} onClick={() => close(onConfirm)} aria-label={confirm}>
            <CheckIcon />
          </button>
        </div>
      </div>
    </div>
  );
};
