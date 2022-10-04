import { Text } from '@ff-client/app/components/form-controls/inputs/text';
import React from 'react';

import { CellFieldWrapper, Label } from './cell-field.styles';

type Props = {
  fieldUid: string;
};

export const CellField: React.FC<Props> = ({ fieldUid }) => {
  return (
    <CellFieldWrapper>
      <Label>{fieldUid}</Label>
      <Text />
    </CellFieldWrapper>
  );
};
