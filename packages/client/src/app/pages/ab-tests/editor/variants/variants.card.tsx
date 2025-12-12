import type { FC } from 'react';
import React from 'react';
import { Dropdown } from '@components/elements/custom-dropdown/dropdown';
import { useQueryFormsWithStats } from '@ff-client/queries/forms';
import type { FormWithStats } from '@ff-client/types/forms';

import { Card, CardFooter, WeightSlider } from './variants.styles';
import type { Variant } from './variants.types';

type Props = {
  variant: Variant;
  form?: FormWithStats;
  updateVariant: (variant: Variant) => void;
  removeVariant?: () => void;
};

export const VariantCard: FC<Props> = ({
  variant,
  updateVariant,
  removeVariant,
}) => {
  const { data: forms, isFetching } = useQueryFormsWithStats();

  return (
    <Card>
      <a onClick={removeVariant}>Remove</a>
      <Dropdown
        emptyOption="Select Form"
        loading={isFetching}
        value={variant.formId?.toString()}
        onChange={(formId) =>
          updateVariant({ ...variant, formId: Number(formId) })
        }
        options={forms?.map((form) => ({
          label: form.name,
          value: form.id.toString(),
        }))}
      />
      <WeightSlider
        value={variant.weight}
        min={0}
        max={100}
        type="range"
        onChange={(event) =>
          updateVariant({
            ...variant,
            weight: Number.parseInt(event.target.value),
          })
        }
      />
      <CardFooter>
        <span>
          Weight: <span>{variant.weight}</span>
        </span>
      </CardFooter>
    </Card>
  );
};
