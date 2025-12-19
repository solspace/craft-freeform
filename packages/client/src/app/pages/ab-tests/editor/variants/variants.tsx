import type { FC } from 'react';
import React from 'react';
import translate from '@ff-client/utils/translations';
import { v4 } from 'uuid';

import { VariantCard } from './variants.card';
import { CreateButton, VariantsContainer } from './variants.styles';
import type { Variant } from './variants.types';

type Props = {
  variants: Variant[];
  updateVariants: (variants: Variant[]) => void;
};

export const Variants: FC<Props> = ({ variants, updateVariants }) => {
  const handleAddVariant = (): void => {
    updateVariants([...variants, { id: v4(), formId: undefined, weight: 0 }]);
  };

  const removeVariand = (index: number): void => {
    updateVariants([...variants.slice(0, index), ...variants.slice(index + 1)]);
  };

  const usedFormIds = variants
    .map((variant) => variant.formId)
    .filter((id): id is number => id !== undefined);

  return (
    <>
      <VariantsContainer>
        {variants?.map((variant, idx) => (
          <VariantCard
            variant={variant}
            usedFormIds={usedFormIds}
            removeVariant={() => {
              if (confirm(translate('Are you sure?'))) {
                removeVariand(idx);
              }
            }}
            updateVariant={(updatedVariant) =>
              updateVariants([
                ...variants.slice(0, idx),
                updatedVariant,
                ...variants.slice(idx + 1),
              ])
            }
            key={variant.id || idx}
          />
        ))}
      </VariantsContainer>

      <CreateButton
        type="button"
        className="btn icon add"
        onClick={handleAddVariant}
      >
        {translate('Add Variant')}
      </CreateButton>
    </>
  );
};
