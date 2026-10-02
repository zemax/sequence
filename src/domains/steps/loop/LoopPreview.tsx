import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import LoopIcon from "@mui/icons-material/Loop";
import RemoveIcon from "@mui/icons-material/Remove";
import { useRef } from "react";
import classNames from "classnames";
import { getUI } from "../../../data/informations";
import { Loop, Step } from "../../../data/sequences/sequencesSlice";
import { SortableEdge } from "../../ui/sortableList/useSortableList";
import { StepList } from "../common/StepList";

import components from "../../../styles/Components.module.scss";
import stepPreviewStyles from "../common/StepPreview.module.scss";
import styles from "./LoopPreview.module.scss";

type Props = {
  loop: Loop;
  onChange: (loop: Loop) => void;
  onEscapeStep: (step: Step) => void;
  edgeAction?: SortableEdge | null;
  isHovered?: boolean;
};

// A Loop is always fully expanded — its body is a permanent drop target (see StepList), not
// something to collapse. repeatCount is edited with a stepper in the header; Steps only ever
// arrive in the body by being dragged in, so there's no add row.
export const LoopPreview = ({ loop, onChange, onEscapeStep, edgeAction, isHovered }: Props) => {
  const envelopeRef = useRef<HTMLDivElement>(null);
  const { loopRepeatCountLabel, loopRepeatLessLabel, loopRepeatMoreLabel } = getUI();

  const setRepeatCount = (repeatCount: number) => onChange({ ...loop, repeatCount: Math.max(1, repeatCount) });

  return (
    <div ref={envelopeRef} className={classNames(styles.loop, isHovered && styles.loopHovered)}>
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
      <div className={classNames(styles.body, loop.steps.length === 0 && styles.bodyEmpty)}>
        <StepList
          items={loop.steps}
          onChange={(steps) => onChange({ ...loop, steps: steps as Step[] })}
          containerRef={envelopeRef}
          onEscapeItem={(item) => onEscapeStep(item as Step)}
        />
      </div>

      <div className={classNames(stepPreviewStyles.deleteOverlay, styles.deleteOverlay, edgeAction === "right" && stepPreviewStyles.deleteOverlayVisible)}>
        <DeleteIcon />
      </div>
    </div>
  );
};
