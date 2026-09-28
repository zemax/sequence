import LoopIcon from "@mui/icons-material/Loop";
import { MouseEvent, useRef } from "react";
import classNames from "classnames";
import { getUI } from "../../../data/informations";
import { Loop, Step } from "../../../data/sequences/sequencesSlice";
import { SortableEdge } from "../../ui/sortableList/useSortableList";
import { StepList } from "../common/StepList";
import { StepPreview } from "../common/StepPreview";

import stepPreviewStyles from "../common/StepPreview.module.scss";
import styles from "./LoopPreview.module.scss";

type Props = {
  loop: Loop;
  onChange: (loop: Loop) => void;
  onEscapeStep: (step: Step) => void;
  edgeAction?: SortableEdge | null;
  isHovered?: boolean;
};

const stopPropagation = (e: MouseEvent) => e.stopPropagation();

// A Loop is always fully expanded — its dashed body is a permanent drop target (see StepList),
// not something to collapse. repeatCount is a plain always-editable field on the solid header
// card above it; Steps only ever arrive in the body by being dragged in, so there's no add row.
export const LoopPreview = ({ loop, onChange, onEscapeStep, edgeAction, isHovered }: Props) => {
  const envelopeRef = useRef<HTMLDivElement>(null);
  const { loopRepeatCountLabel } = getUI();

  return (
    <div className={styles.loopWrapper}>
      <StepPreview icon={<LoopIcon />} edgeAction={edgeAction} className={styles.loopHeader}>
        <label className={stepPreviewStyles.durationField} onClick={stopPropagation}>
          <span className={stepPreviewStyles.secondaryText}>{loopRepeatCountLabel}</span>
          <input
            type="number"
            min={1}
            className={stepPreviewStyles.durationInput}
            value={loop.repeatCount}
            onChange={(e) => onChange({ ...loop, repeatCount: Number(e.target.value) })}
          />
        </label>
      </StepPreview>

      {/* Loops can't contain Loops (see concepts.md), so this nested StepList never sets
          allowLoop — the resulting items are always Steps despite the shared SequenceItem[] type. */}
      <div ref={envelopeRef} className={classNames(styles.loopBody, isHovered && styles.loopBodyHovered)}>
        <StepList
          items={loop.steps}
          onChange={(steps) => onChange({ ...loop, steps: steps as Step[] })}
          containerRef={envelopeRef}
          onEscapeItem={(item) => onEscapeStep(item as Step)}
        />
      </div>
    </div>
  );
};
