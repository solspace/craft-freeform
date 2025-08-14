import React from 'react';
import { HelpText } from '@components/elements/help-text';
import type { UpdateValue } from '@components/form-controls';
import translate from '@ff-client/utils/translations';

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
  return (
    <CardsEditorWrapper>
      <CardsContainer>
        <CardList>
          {value.map((card, idx) => (
            <CardItem
              key={idx}
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
