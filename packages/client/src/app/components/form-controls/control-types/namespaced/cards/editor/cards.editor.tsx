import React, { useEffect, useRef } from 'react';
import { HelpText } from '@components/elements/help-text';
import type { UpdateValue } from '@components/form-controls';
import translate from '@ff-client/utils/translations';
import Sortable from 'sortablejs';

import { addCard } from '../cards.operations';
import type { Card } from '../cards.types';

import { CardItem } from './card.item';
import { CardPlaceholder } from './card.placeholder';
import {
  CardList,
  CardsContainer,
  CardsEditorWrapper,
} from './cards.editor.styles';

type Props = {
  value: Card[];
  updateValue: UpdateValue<Card[]>;
};

export const CardsEditor: React.FC<Props> = ({ value, updateValue }) => {
  const gridRef = useRef(null);

  useEffect(() => {
    if (!gridRef.current) {
      return;
    }

    const sortable = Sortable.create(gridRef.current, {
      animation: 150,
      ghostClass: 'sortable-ghost',
      handle: '.drag-handle',
      onEnd: (event) => {
        const newCards = [...value];
        const [movedCard] = newCards.splice(event.oldIndex, 1);
        newCards.splice(event.newIndex, 0, movedCard);
        updateValue(newCards);
      },
    });

    return () => {
      sortable.destroy();
    };
  }, [value]);

  return (
    <CardsEditorWrapper>
      <CardsContainer>
        <CardList ref={gridRef}>
          {value.map((card, idx) => (
            <CardItem
              key={card.id}
              card={card}
              removeCard={() => {
                const newCards = [...value];
                newCards.splice(idx, 1);
                updateValue(newCards);
              }}
              updateCard={(updatedCard) => {
                const newCards = [...value];
                newCards[idx] = updatedCard;
                updateValue(newCards);
              }}
            />
          ))}

          <CardPlaceholder
            onClick={() => updateValue(addCard(value, value.length))}
          />
        </CardList>
      </CardsContainer>

      <HelpText>
        <span
          dangerouslySetInnerHTML={{
            __html: translate(
              'Press <b>enter</b> while editing a cell to add a new row.'
            ),
          }}
        />
      </HelpText>
    </CardsEditorWrapper>
  );
};
