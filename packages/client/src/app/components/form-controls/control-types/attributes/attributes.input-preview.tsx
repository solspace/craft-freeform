import React from 'react';

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
  name: string;
  attributes: AttributeEntry[];
};

export const InputPreview: React.FC<Props> = ({ name, attributes }) => {
  const showableTags = ['input', 'label', 'select', 'table'];
  if (!showableTags.includes(name)) {
    name = '...';
  }

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
