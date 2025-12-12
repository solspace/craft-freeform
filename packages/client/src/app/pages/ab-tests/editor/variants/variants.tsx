import type { FC } from 'react';
import React from 'react';
import { v4 } from 'uuid';

import { VariantCard } from './variants.card';
import { VariantsContainer } from './variants.styles';
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

  return (
    <VariantsContainer>
      {variants?.map((variant, idx) => (
        <VariantCard
          variant={variant}
          removeVariant={() => removeVariand(idx)}
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

      {<div onClick={handleAddVariant}>add new variant</div>}
    </VariantsContainer>
  );
};
