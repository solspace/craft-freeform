import type { FC } from 'react';
import React from 'react';
import { NoContent } from '@components/form-controls/control-types/tabular-data/tabular-data.preview.styles';
import { PreviewWrapper } from '@components/form-controls/preview/previewable-component.styles';
import translate from '@ff-client/utils/translations';

import type { Card } from '../cards.types';

import {
  Description,
  Image,
  Label,
  PreviewCard,
  PreviewCardsList,
} from './cards.preview.styles';
import PlaceholderIcon from './placeholder.icon.svg';

type Props = {
  cards: Card[];
};

export const CardsPreview: FC<Props> = ({ cards }) => {
  return (
    <PreviewWrapper data-edit={translate('Click to edit data')}>
      {!cards.length && <NoContent>{translate('Not cards added')}</NoContent>}
      <PreviewCardsList>
        {cards.map((card, index) => (
          <PreviewCard key={index} data-title={'card'}>
            <Image>
              {card.assetId && (
                <img
                  src={Craft.getCpUrl(
                    `freeform/api/assets/thumb/card/${card.assetId}`
                  )}
                  alt={card.label || translate('No title')}
                />
              )}
              {!card.assetId && <PlaceholderIcon />}
            </Image>
            <Label>{card.label || translate('No title')}</Label>
            <Description>
              {card.description || translate('No description')}
            </Description>
          </PreviewCard>
        ))}
      </PreviewCardsList>
    </PreviewWrapper>
  );
};
