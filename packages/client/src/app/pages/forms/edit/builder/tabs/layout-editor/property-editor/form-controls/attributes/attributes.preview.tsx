import React from 'react';
import classes from '@ff-client/utils/classes';

import {
  Name,
  Operator,
  Quote,
  Value,
} from './attributes.input-preview.styles';
import { attributesToArray } from './attributes.operations';
import {
  AttributeItem,
  AttributeList,
  AttributeListWrapper,
  AttributeTitle,
  PreviewWrapper,
} from './attributes.preview.styles';
import type { Attribute, AttributeCollection } from './attributes.types';

type Props = {
  attributes: AttributeCollection;
};

const RenderAttributes: React.FC<{ name: string; attributes: Attribute[] }> = ({
  name,
  attributes,
}) => {
  const attributeArray = attributesToArray(attributes);

  return (
    <AttributeListWrapper
      className={classes(!attributeArray.length && 'empty')}
    >
      <AttributeTitle>{name}</AttributeTitle>
      {!!attributeArray.length && (
        <AttributeList>
          {attributeArray.map(([name, value], idx) => (
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
