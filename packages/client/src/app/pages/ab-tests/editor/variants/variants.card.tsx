import type { FC } from 'react';
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { NavLink } from 'react-router-dom';
import { Dropdown } from '@components/elements/custom-dropdown/dropdown';
import { RemoveButton } from '@components/elements/remove-button/remove';
import { Control } from '@components/form-controls/control';
import { useQueryFormsWithStats } from '@ff-client/queries/forms';
import { colors } from '@ff-client/styles/variables';
import type { FormWithStats } from '@ff-client/types/forms';
import { PropertyType } from '@ff-client/types/properties';

import { useAbTestsStatistics } from '../../ab-tests.queries';

import {
  Card,
  WeightContainer,
  WeightInput,
  WeightSlider,
  WeightWrapper,
} from './variants.styles';
import type { Variant } from './variants.types';

type Props = {
  variant: Variant;
  form?: FormWithStats;
  usedFormIds?: number[];
  updateVariant: (variant: Variant) => void;
  removeVariant?: () => void;
};

export const VariantCard: FC<Props> = ({
  variant,
  usedFormIds,
  updateVariant,
  removeVariant,
}) => {
  const { data: forms, isFetching } = useQueryFormsWithStats();
  const { data: statistics } = useAbTestsStatistics();

  const form = forms?.find((f) => f.id === variant.formId);
  const formOptions = forms
    ?.filter((form) => !usedFormIds?.includes(form.id))
    .map((form) => ({
      label: form.name,
      value: form.id.toString(),
    }));

  const stats = statistics?.[variant.id] || undefined;

  return (
    <Card>
      <RemoveButton
        active
        type="button"
        onClick={removeVariant}
        style={{ position: 'absolute', top: 5, right: 5 }}
      />

      <Control
        property={{
          label: 'Form',
          type: PropertyType.String,
          handle: 'formId',
        }}
      >
        {!variant.formId && (
          <Dropdown
            emptyOption="Select Form"
            loading={isFetching}
            value={variant.formId?.toString()}
            options={formOptions}
            onChange={(formId) =>
              updateVariant({ ...variant, formId: Number(formId) })
            }
          />
        )}

        {variant.formId && isFetching && (
          <Skeleton
            width="100%"
            height={32}
            baseColor={colors.blue050}
            highlightColor={colors.blue100}
          />
        )}

        {variant.formId && form && (
          <ul>
            <li>
              <div className="chip small element removable fullwidth">
                <div className="chip-content">
                  <span className="status open teal" />
                  <NavLink to={`/forms/${form.id}`} target="_blank">
                    <span>{form.name}</span>
                  </NavLink>
                </div>
              </div>
            </li>
          </ul>
        )}
      </Control>

      <Control
        property={{
          label: 'Weight',
          type: PropertyType.Integer,
          handle: 'weight',
        }}
      >
        <WeightContainer className="text fullwidth">
          <WeightInput
            name="weight"
            type="number"
            value={variant.weight}
            onChange={(event) =>
              updateVariant({
                ...variant,
                weight: Number(event.target.value),
              })
            }
          />

          <WeightWrapper>
            <span>0</span>
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
            <span>100</span>
          </WeightWrapper>
        </WeightContainer>
      </Control>

      <Control
        property={{
          label: 'Statistics',
          handle: 'statistics',
          type: PropertyType.String,
        }}
      >
        <ul>
          <li>Impressions: {stats?.served || 0}</li>
          <li>Interactions: {stats?.interacted || 0}</li>
          <li>Failiures: {stats?.failed || 0}</li>
          <li>Conversions: {stats?.completed || 0}</li>
        </ul>
      </Control>
    </Card>
  );
};
