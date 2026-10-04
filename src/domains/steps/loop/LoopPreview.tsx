import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import LoopIcon from "@mui/icons-material/Loop";
import RemoveIcon from "@mui/icons-material/Remove";
import { useLayoutEffect, useRef, useState } from "react";
import classNames from "classnames";
import { getUI } from "../../../data/informations";
import { Loop, Step } from "../../../data/sequences/sequencesSlice";
import { DroppedGeometry, SortableEdge } from "../../ui/sortableList/useSortableList";
import { StepList } from "../common/StepList";

import components from "../../../styles/Components.module.scss";
import stepPreviewStyles from "../common/StepPreview.module.scss";
import styles from "./LoopPreview.module.scss";

const HEIGHT_TRANSITION_MS = 250;

type Props = {
  loop: Loop;
  onChange: (loop: Loop) => void;
  onEscapeStep: (step: Step, index: number, dropped: DroppedGeometry) => void;
  onEscapeHover: (index: number | null) => void;
  edgeAction?: SortableEdge | null;
  isHovered?: boolean;
};

export const LoopPreview = ({ loop, onChange, onEscapeStep, onEscapeHover, edgeAction, isHovered }: Props) => {
  const envelopeRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const bodyHeight = useRef<number | null>(null);
  const [escaping, setEscaping] = useState(false);
  const { loopRepeatCountLabel, loopRepeatLessLabel, loopRepeatMoreLabel } = getUI();

  const parentDropIndexAt = (clientY: number) => {
    const rows = [...(envelopeRef.current?.closest("ul")?.children ?? [])].slice(0, -1);
    return rows.filter((row) => {
      const rect = row.getBoundingClientRect();
      return clientY > rect.top + rect.height / 2;
    }).length;
  };

  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) {
      return;
    }

    const next = body.offsetHeight;
    const previous = bodyHeight.current;
    bodyHeight.current = next;
    if (previous === null || previous === next || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    body.style.height = `${previous}px`;
    body.style.overflow = "hidden";
    body.getBoundingClientRect();
    body.style.transition = `height ${HEIGHT_TRANSITION_MS}ms ease`;
    body.style.height = `${next}px`;

    const clear = () => {
      body.style.height = "";
      body.style.overflow = "";
      body.style.transition = "";
    };
    const timeout = setTimeout(clear, HEIGHT_TRANSITION_MS + 50);
    return () => clearTimeout(timeout);
  }, [loop.steps.length]);

  useLayoutEffect(() => {
    if (bodyRef.current && !bodyRef.current.style.height) {
      bodyHeight.current = bodyRef.current.offsetHeight;
    }
  });

  const setRepeatCount = (repeatCount: number) => onChange({ ...loop, repeatCount: Math.max(1, repeatCount) });

  return (
    <div ref={envelopeRef} className={classNames(styles.loop, isHovered && styles.loopHovered, escaping && styles.loopEscaping)}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <LoopIcon />
          <span>{loopRepeatCountLabel}</span>
        </div>
        <div className={styles.stepper}>
          <button type="button" className={components.ghost} onClick={() => setRepeatCount(loop.repeatCount - 1)} aria-label={loopRepeatLessLabel}>
            <RemoveIcon />
          </button>
          <span className={styles.count}>{loop.repeatCount}</span>
          <button type="button" className={components.ghost} onClick={() => setRepeatCount(loop.repeatCount + 1)} aria-label={loopRepeatMoreLabel}>
            <AddIcon />
          </button>
        </div>
      </div>

      {/* Loops can't contain Loops (see concepts.md), so this nested StepList never sets
          allowLoop — the resulting items are always Steps despite the shared SequenceItem[] type. */}
      <div ref={bodyRef} className={classNames(styles.body, loop.steps.length === 0 && styles.bodyEmpty)}>
        <StepList
          items={loop.steps}
          onChange={(steps) => onChange({ ...loop, steps: steps as Step[] })}
          containerRef={envelopeRef}
          onEscapeItem={(item, clientY, dropped) => onEscapeStep(item as Step, parentDropIndexAt(clientY), dropped)}
          onEscapePointer={(clientY) => {
            setEscaping(clientY !== null);
            onEscapeHover(clientY === null ? null : parentDropIndexAt(clientY));
          }}
        />
      </div>

      {isHovered && <div className={styles.insertBar} />}

      <div className={classNames(stepPreviewStyles.deleteOverlay, styles.deleteOverlay, edgeAction === "right" && stepPreviewStyles.deleteOverlayVisible)}>
        <DeleteIcon />
      </div>
    </div>
  );
};
