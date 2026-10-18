import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { WizardDraft } from "./wizard.types";

export const PRESET_FIELD_DURATION = 760;

/** Reveal a preset in the preview only; the complete draft is always editable. */
export function useWizardPresetAnimation(
  draft: WizardDraft,
  enabled: boolean,
  skip: number,
) {
  const previous = useRef(draft);
  const [sequence, setSequence] = useState<{
    draft: WizardDraft;
    count: number;
  }>();
  const active = enabled && sequence?.draft === draft;
  useLayoutEffect(() => {
    const before = previous.current;
    previous.current = draft;
    if (
      enabled &&
      before.purpose !== draft.purpose &&
      draft.purpose &&
      draft.fields.length
    )
      setSequence({ draft, count: 1 });
    else if (!enabled || (before !== draft && before.purpose === draft.purpose))
      setSequence(undefined);
  }, [draft, enabled]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Only a new skip command cancels a sequence.
  useLayoutEffect(() => {
    setSequence(undefined);
  }, [skip]);
  useEffect(() => {
    if (!active || !sequence) return;
    const timer = setTimeout(
      () =>
        setSequence((current) =>
          current && current.count < draft.fields.length
            ? { ...current, count: current.count + 1 }
            : undefined,
        ),
      PRESET_FIELD_DURATION,
    );
    return () => clearTimeout(timer);
  }, [active, draft, sequence]);
  const count = active ? sequence!.count : draft.fields.length;
  return {
    active,
    count,
    field: active ? draft.fields[count - 1] : undefined,
    preview: active
      ? { ...draft, fields: draft.fields.slice(0, count) }
      : draft,
  };
}
