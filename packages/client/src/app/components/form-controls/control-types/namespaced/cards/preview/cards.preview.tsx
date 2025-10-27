import type { FC } from 'react';
import React from 'react';
import { NoContent } from '@components/form-controls/control-types/tabular-data/tabular-data.preview.styles';
import { PreviewWrapper } from '@components/form-controls/preview/previewable-component.styles';
import { type AssetUrl, useAssetQuery } from '@ff-client/queries/assets';
import translate from '@ff-client/utils/translations';

import type { Card } from '../cards.types';

import {
  Description,
  Image,
  Label,
  PreviewCard,
  PreviewCardsList,
  SpinnerWrapper,
} from './cards.preview.styles';
import PlaceholderIcon from './placeholder.icon.svg';
import SpinnerIcon from './spinner.icon.svg';

type Props = {
  cards: Card[];
  transform?: string;
};

export const CardsPreview: FC<Props> = ({ cards, transform }) => {
  const assetIds = cards.map((card) => card.assetId).filter(Boolean);
  const { data, isFetching } = useAssetQuery(assetIds, transform);

  return (
    <PreviewWrapper data-edit={translate('Click to edit data')}>
      {!cards.length && (
        <NoContent>
          {translate('No cards yet. Click Add Card to create one.')}
        </NoContent>
      )}
      <PreviewCardsList>
        {cards.map((card, index) => (
          <PreviewCard key={index} data-title={'card'}>
            <Image>
              <ImageElement
                assetUrl={data?.[card.assetId]}
                loading={isFetching}
              />
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

type ImageElementProps = {
  assetUrl?: AssetUrl;
  loading: boolean;
};

const ImageElement: FC<ImageElementProps> = ({ assetUrl, loading }) => {
  if (loading) {
    return (
      <SpinnerWrapper>
        <SpinnerIcon />
      </SpinnerWrapper>
    );
  }

  if (assetUrl === undefined) {
    return <PlaceholderIcon />;
  }

  return (
    <img src={assetUrl.src} alt={assetUrl.title || translate('No title')} />
  );
};
