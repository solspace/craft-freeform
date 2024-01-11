import React, { useRef } from 'react';
import { useHover } from '@ff-client/hooks/use-hover';
import { useFieldType } from '@ff-client/queries/field-types';
import CrossIcon from '@ff-icons/actions/cross.svg';

import { Icon, Name, Remove, Wrapper } from './model.list-item.styles';

type Props = {
  typeClass: string;
};

export const FieldItem: React.FC<Props> = ({ typeClass }) => {
  const fieldType = useFieldType(typeClass);

  const fieldItemRef = useRef<HTMLDivElement>(null);
  const hovering = useHover(fieldItemRef);

  if (!fieldType) {
    return null;
  }

  const { name, icon } = fieldType;

  return (
    <Wrapper data-id={typeClass} ref={fieldItemRef} title={name}>
      <Icon dangerouslySetInnerHTML={{ __html: icon }} />
      <Name>{name}</Name>

      {hovering && (
        <Remove className="remove field-item-remove">
          <CrossIcon />
        </Remove>
      )}
    </Wrapper>
  );
};
