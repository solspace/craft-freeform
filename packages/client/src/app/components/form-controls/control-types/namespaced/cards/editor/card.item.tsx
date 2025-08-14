import type { FC } from 'react';
import React from 'react';
import { CraftAssetPicker } from '@components/elements/craft-asset-picker/craft-asset-picker';
import { RemoveButton } from '@components/elements/remove-button/remove';
import { ControlBlock } from '@components/form-controls/control.block';
import translate from '@ff-client/utils/translations';

import type { Card } from '../cards.types';

import { Item, TextArea } from './card.item.styles';

type Props = {
  card: Card;
  removeCard: () => void;
  updateCard: (card: Card) => void;
};

export const CardItem: FC<Props> = ({ card, updateCard, removeCard }) => {
  const { label, value, assetId, description } = card;

  return (
    <Item>
      <RemoveButton
        style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}
        active
        onClick={removeCard}
        title={translate('Remove card')}
      />

      <ControlBlock label="Image">
        <CraftAssetPicker
          criteria={{ kind: ['image'] }}
          value={assetId ? [assetId] : []}
          onUpdate={(assetIds) =>
            updateCard({ ...card, assetId: assetIds[0] ?? undefined })
          }
        />
      </ControlBlock>

      <ControlBlock label="Title">
        <input
          type="text"
          className="text fullwidth"
          value={label}
          onChange={(event) =>
            updateCard({ ...card, label: event.target.value })
          }
        />
      </ControlBlock>

      <ControlBlock
        label="Value"
        instructions="Provide a custom value for the card, when selected"
      >
        <input
          type="text"
          className="text fullwidth"
          value={value}
          onChange={(event) =>
            updateCard({ ...card, value: event.target.value })
          }
        />
      </ControlBlock>

      <ControlBlock label="Description">
        <TextArea
          rows={4}
          className="text fullwidth"
          value={description}
          onChange={(event) =>
            updateCard({ ...card, description: event.target.value })
          }
        />
      </ControlBlock>
    </Item>
  );
};
