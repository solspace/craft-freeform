import { useCodeblockText } from "@ff-client/hooks/use-codeblock-text";
import translate from "@ff-client/utils/translations";
import type React from "react";
import { memo, useMemo } from "react";

import { Instructions } from "./control.styles";

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

export default FormInstructions;
