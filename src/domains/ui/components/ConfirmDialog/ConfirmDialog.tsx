import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useRef } from "react";
import { getUI } from "../../../../data/informations";

import components from "../../../../styles/Components.module.scss";
import styles from "./ConfirmDialog.module.scss";

type Props = {
  title: string;
  // Optional explanation shown under the title.
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

// A small question dialog ("Supprimer ?", "Réinitialiser ?"…): X cancels, check confirms. Escape or a
// tap on the backdrop cancels too.
export const ConfirmDialog = ({ title, message, onConfirm, onCancel }: Props) => {
  const { cancel, confirm } = getUI();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <div className={styles.backdrop} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className={styles.dialog} role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
        <h2 id="confirm-dialog-title" className={styles.title}>
          {title}
        </h2>
        {message && <p className={styles.message}>{message}</p>}
        <div className={styles.buttons}>
          <button ref={cancelRef} type="button" className={components.ghostLarge} onClick={onCancel} aria-label={cancel}>
            <CloseIcon />
          </button>
          <button type="button" className={components.action} onClick={onConfirm} aria-label={confirm}>
            <CheckIcon />
          </button>
        </div>
      </div>
    </div>
  );
};
