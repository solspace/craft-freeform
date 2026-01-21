import React, { useEffect, useRef } from 'react';
import { HelpText } from '@components/elements/help-text';
import type { UpdateValue } from '@components/form-controls';
import type { Field } from '@editor/store/slices/layout/fields';
import { useTranslations } from '@editor/store/slices/translations/translations.hooks';
import type { CardsProperty } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';
import { sanitize } from 'dompurify';
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
  property: CardsProperty;
  updateValue: UpdateValue<Card[]>;
  context: Field;
};

export const CardsEditor: React.FC<Props> = ({
  value,
  property,
  updateValue,
  context,
}) => {
  const gridRef = useRef(null);
  const { updateTranslation, getTranslation, willTranslate } =
    useTranslations(context);

  const isTranslating = willTranslate(property.handle);
  const translation = getTranslation<Card[]>(property.handle, value);

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
                if (isTranslating) {
                  const newTranslations = [...translation];
                  newTranslations[idx] = updatedCard;
                  updateTranslation(property.handle, newTranslations);
                } else {
                  const newCards = [...value];
                  newCards[idx] = updatedCard;

                  updateValue(newCards);
                }
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
            __html: sanitize(
              translate(
                'Press <b>enter</b> while editing a cell to add a new row.'
              )
            ),
          }}
        />
      </HelpText>
    </CardsEditorWrapper>
  );
};
