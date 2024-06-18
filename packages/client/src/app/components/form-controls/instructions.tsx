import React from 'react';
import translate from '@ff-client/utils/translations';

import { Instructions } from './control.styles';

type Props = {
  instructions: string;
};

const FormInstructions: React.FC<Props> = ({ instructions }) => {
  if (!instructions) {
    return null;
  }

  instructions = translate(instructions);

  const parts = instructions.split(/`([^`]+)`/g);
  const compiledInstructions = parts.map((part, index) => {
    // Odd indices contain the text inside backticks
    if (index % 2 !== 0) {
      return <code key={index}>{part}</code>;
    }
    return part;
  });

  return <Instructions>{compiledInstructions}</Instructions>;
};

export default FormInstructions;
