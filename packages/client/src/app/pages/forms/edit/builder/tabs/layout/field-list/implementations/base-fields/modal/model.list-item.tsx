import React, { useRef } from 'react';
import { useHover } from '@ff-client/hooks/use-hover';
import { useFieldType } from '@ff-client/queries/field-types';
import CrossIcon from '@ff-icons/actions/cross.svg';

import { Icon, Name, Remove, Wrapper } from './model.list-item.styles';

type Props = {
  typeClass: string;
  typeIndex: number;
  addItemToUnassigned?: () => void;
};

export const FieldItem: React.FC<Props> = ({
  typeClass,
  typeIndex,
  addItemToUnassigned,
}) => {
  const fieldType = useFieldType(typeClass);
  const { name, icon } = fieldType;

  const fieldItemRef = useRef<HTMLDivElement>(null);
  const hovering = useHover(fieldItemRef);

  const removeFieldItem = (): void => {
    fieldItemRef.current?.parentNode?.removeChild(fieldItemRef.current);
    addItemToUnassigned();
  };

  return (
    <Wrapper data-types-index={typeIndex} ref={fieldItemRef} title={name}>
      <Icon dangerouslySetInnerHTML={{ __html: icon }} />
      <Name>{name}</Name>

      {hovering && addItemToUnassigned && (
        <Remove onClick={removeFieldItem} className="remove">
          <CrossIcon />
        </Remove>
      )}
    </Wrapper>
  );
};
