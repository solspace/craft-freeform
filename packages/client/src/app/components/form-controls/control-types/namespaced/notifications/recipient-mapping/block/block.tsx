import React from 'react';

import { Recipients } from './recipients/recipients';
import { Template } from './template/template';
import { Value } from './value/value';
import { BlockWrapper } from './block.styles';

export const RecipientMappingBlock: React.FC = () => {
  return (
    <BlockWrapper>
      <Value />
      <Template />
      <Recipients />
    </BlockWrapper>
  );
};
