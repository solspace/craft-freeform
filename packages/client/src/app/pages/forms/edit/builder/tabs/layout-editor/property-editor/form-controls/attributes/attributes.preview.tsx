import React from 'react';
import classes from '@ff-client/utils/classes';

import { attributesToArray } from './attributes.operations';
import {
  AttributeItem,
  AttributeList,
  AttributeListWrapper,
  AttributeTitle,
  Name,
  Operator,
  PreviewWrapper,
  Quote,
  Value,
} from './attributes.preview.styles';
import type { Attribute, AttributeCollection } from './attributes.types';

type Props = {
  attributes: AttributeCollection;
};

const RenderAttributes: React.FC<{ name: string; attributes: Attribute[] }> = ({
  name,
  attributes,
}) => {
  return (
    <AttributeListWrapper className={classes(!attributes.length && 'empty')}>
      <AttributeTitle>{name}</AttributeTitle>
      {!!attributes.length && (
        <AttributeList>
          {attributesToArray(attributes).map(([name, value], idx) => (
            <AttributeItem key={idx}>
              <Name>{name}</Name>
              {!!value && (
                <>
                  <Operator>=</Operator>
                  <Quote />
                  <Value>{value}</Value>
                  <Quote />
                </>
              )}
            </AttributeItem>
          ))}
        </AttributeList>
      )}
    </AttributeListWrapper>
  );
};

export const AttributePreview: React.FC<Props> = ({ attributes }) => {
  return (
    <PreviewWrapper>
      {Object.entries(attributes).map(([key, value]) => (
        <RenderAttributes key={key} name={key} attributes={value} />
      ))}
    </PreviewWrapper>
  );
};
