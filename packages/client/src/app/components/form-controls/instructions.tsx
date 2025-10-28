import React, { memo, useMemo } from 'react';
import { useCodeblockText } from '@ff-client/hooks/use-codeblock-text';
import translate from '@ff-client/utils/translations';

import { Instructions } from './control.styles';

type Props = {
  instructions: string;
};

const FormInstructions: React.FC<Props> = memo(({ instructions }) => {
  if (!instructions) {
    return null;
  }

  const translatedInstructions = useMemo(
    () => translate(instructions),
    [instructions]
  );

  const compiledInstructions = useCodeblockText(translatedInstructions);

  return <Instructions>{compiledInstructions}</Instructions>;
});

FormInstructions.displayName = 'FormInstructions';

export default FormInstructions;
