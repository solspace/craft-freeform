import { useCodeblockText } from "@ff-client/hooks/use-codeblock-text";
import translate from "@ff-client/utils/translations";
import type React from "react";
import type { PropsWithChildren } from "react";
import { memo, useId, useMemo, useState } from "react";

import {
  InstructionHelpButton,
  InstructionHelpContent,
  InstructionHelpText,
  InstructionLabelRow,
  Instructions,
} from "./control.styles";

type Props = {
  instructions: string;
};

const FormInstructions: React.FC<Props> = memo(({ instructions }) => {
  const translatedInstructions = useMemo(() => {
    if (!instructions) {
      return null;
    }

    return translate(instructions);
  }, [instructions]);

  const compiledInstructions = useCodeblockText(translatedInstructions);
  if (!compiledInstructions) {
    return null;
  }

  return <Instructions>{compiledInstructions}</Instructions>;
});

FormInstructions.displayName = "FormInstructions";

export const CollapsibleFieldHelp: React.FC<
  PropsWithChildren<Props & { label: string }>
> = ({ label, instructions, children }) => {
  const [open, setOpen] = useState(false);
  const instructionsId = useId();

  return (
    <>
      <InstructionLabelRow>
        {children}
        <InstructionHelpButton
          type="button"
          aria-label={translate("Help for {label}", {
            label: translate(label),
          })}
          aria-expanded={open}
          aria-controls={instructionsId}
          onClick={() => setOpen((value) => !value)}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="8" cy="8" r="7" fill="currentColor" />
            <circle cx="8" cy="4.5" r="0.85" fill="#fff" />
            <path
              d="M7 7h1v4.5m-1 0h2"
              fill="none"
              stroke="#fff"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </InstructionHelpButton>
      </InstructionLabelRow>
      <InstructionHelpText
        id={instructionsId}
        $open={open}
        aria-hidden={!open}
        inert={!open}
      >
        <InstructionHelpContent>
          <FormInstructions instructions={instructions} />
        </InstructionHelpContent>
      </InstructionHelpText>
    </>
  );
};

export default FormInstructions;
