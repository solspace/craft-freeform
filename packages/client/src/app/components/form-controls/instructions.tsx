import React from 'react';

import { Instructions } from './control.styles';

type Props = {
  instructions: string;
};

const FormInstructions: React.FC<Props> = ({ instructions }) => (
  <Instructions>{instructions}</Instructions>
);

export default FormInstructions;
