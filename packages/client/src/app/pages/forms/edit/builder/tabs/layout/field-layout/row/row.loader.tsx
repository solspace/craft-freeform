import React from 'react';

import { LoaderField } from '../field/field.loader';

import { RowFieldsContainer, RowWrapper } from './row.styles';

export const LoaderRow: React.FC = () => {
  return (
    <RowWrapper>
      <RowFieldsContainer>
        <LoaderField />
      </RowFieldsContainer>
    </RowWrapper>
  );
};
