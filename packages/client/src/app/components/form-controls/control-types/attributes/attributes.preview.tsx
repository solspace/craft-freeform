import React from 'react';
import type {
  AttributeProperty,
  AttributeTab,
} from '@ff-client/types/properties';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

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
import type {
  AttributeEntry,
  EditableAttributeCollection,
} from './attributes.types';

type Props = {
  property: AttributeProperty;
  attributes: EditableAttributeCollection;
};

const RenderAttributes: React.FC<{
  tab: AttributeTab;
  attributes: AttributeEntry[];
}> = ({ tab, attributes }) => {
  const attributeArray = attributesToArray(attributes);

  return (
    <AttributeListWrapper
      className={classes(!attributeArray.length && 'empty')}
    >
      <AttributeTitle>{translate(tab.label)}</AttributeTitle>
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

export const AttributePreview: React.FC<Props> = ({ property, attributes }) => {
  return (
    <PreviewWrapper>
      {property.tabs &&
        property.tabs.map((tab) => (
          <RenderAttributes
            key={tab.handle}
            tab={tab}
            attributes={attributes[tab.handle] || []}
          />
        ))}
    </PreviewWrapper>
  );
};
