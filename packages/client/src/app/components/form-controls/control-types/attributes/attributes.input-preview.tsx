import React from 'react';
import type { AttributeTab } from '@ff-client/types/properties';

import {
  CodeBlock,
  Name,
  Operator,
  Quote,
  Value,
} from './attributes.input-preview.styles';
import { attributesToArray } from './attributes.operations';
import type { AttributeEntry } from './attributes.types';

type Props = {
  tab: AttributeTab;
  attributes: AttributeEntry[];
};

export const InputPreview: React.FC<Props> = ({ tab, attributes }) => {
  return (
    <CodeBlock>
      {'<'}
      {tab.previewTag}
      {attributesToArray(attributes).map(([name, value], idx) => (
        <span key={idx}>
          <Name> {name}</Name>
          {!!value && (
            <>
              <Operator>=</Operator>
              <Quote />
              <Value>{value}</Value>
              <Quote />
            </>
          )}
        </span>
      ))}
      {' />'}
    </CodeBlock>
  );
};
