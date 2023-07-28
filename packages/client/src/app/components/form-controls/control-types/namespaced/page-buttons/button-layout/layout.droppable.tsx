import React from 'react';
import { useDrop } from 'react-dnd';
import type { PageButtonsLayoutProperty } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';

import {
  LayoutContainer,
  LayoutElement,
  SpaceLayoutElement,
} from './layout.droppable.styles';
import { extractElements } from './layout.operations';
import { ElementType } from './layout.types';

type Props = {
  layout: string;
  property: PageButtonsLayoutProperty;
};

export const Droppable: React.FC<Props> = ({ layout, property }) => {
  const elements = extractElements(layout);

  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: [ElementType.Element, ElementType.LayoutElement],
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  let backgroundColor = 'white';
  if (canDrop) backgroundColor = 'darkkhaki';
  if (isOver) backgroundColor = 'khaki';

  return (
    <LayoutContainer ref={drop} style={{ backgroundColor }}>
      {elements.map(({ type }, idx) => {
        if (type === 'space') {
          return (
            <SpaceLayoutElement key={idx}>
              {translate('Space')}
            </SpaceLayoutElement>
          );
        }

        const button = property.elements.find((el) => el.value === type);

        return <LayoutElement key={idx}>{button.label}</LayoutElement>;
      })}
    </LayoutContainer>
  );
};
