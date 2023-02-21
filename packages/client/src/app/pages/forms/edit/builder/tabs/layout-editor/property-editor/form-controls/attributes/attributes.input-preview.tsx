import React from 'react';

import {
  CodeBlock,
  Name,
  Operator,
  Quote,
  Value,
} from './attributes.input-preview.styles';
import { attributesToArray } from './attributes.operations';
import type { Attribute } from './attributes.types';

type Props = {
  name: string;
  attributes: Attribute[];
};

export const InputPreview: React.FC<Props> = ({ name, attributes }) => {
  return (
    <CodeBlock>
      {'<'}
      {name}
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
