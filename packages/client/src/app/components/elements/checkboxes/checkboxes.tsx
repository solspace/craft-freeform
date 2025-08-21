import type { FC } from 'react';
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import FormInstructions from '@components/form-controls/instructions';
import type { Option, OptionCollection } from '@ff-client/types/properties';
import { generateRandomHash } from '@ff-client/utils/hash';
import translate from '@ff-client/utils/translations';

import { CheckboxesWrapper, SelectAllWrapper } from './checkboxes.styles';

const skeletonWidths = [100, 150, 170, 130];

type Value = string | number;

type Props = {
  value: Array<Value>;
  options?: OptionCollection;
  selectAll?: boolean;
  loading?: boolean;
  uniqueId?: string;
  columns?: number;
  emptyMessage?: string;
  onUpdate: (value: Array<Value>) => void;
};

export const Checkboxes: FC<Props> = ({
  value,
  options,
  selectAll,
  loading,
  uniqueId,
  columns,
  emptyMessage,
  onUpdate,
}) => {
  const isAllSelected = value.length === options?.length;

  if (!uniqueId) {
    uniqueId = generateRandomHash(6);
  }

  return (
    <>
      {selectAll && (
        <SelectAllWrapper>
          <input
            id={`${uniqueId}-all`}
            type="checkbox"
            className="checkbox"
            checked={isAllSelected}
            onChange={() => {
              if (isAllSelected) {
                onUpdate([]);
              } else {
                onUpdate(
                  options
                    .filter((option) => !('children' in option))
                    .map((option) => (option as Option).value)
                );
              }
            }}
          />
          <label htmlFor={`${uniqueId}-all`}>{translate('Select All')}</label>
        </SelectAllWrapper>
      )}

      {!loading && !options?.length && emptyMessage && (
        <FormInstructions instructions={emptyMessage} />
      )}

      <CheckboxesWrapper $columns={columns}>
        {loading && (
          <>
            {Array.from({ length: options?.length || 4 }).map((_, index) => (
              <Skeleton
                key={index}
                width={skeletonWidths[index % skeletonWidths.length]}
                height={15}
              />
            ))}
          </>
        )}

        {!loading &&
          options?.map((option) => {
            if ('children' in option) {
              return null;
            }

            const id = `${uniqueId}-${option?.label}`;

            return (
              <div key={option.value} title={option.label}>
                <input
                  id={id}
                  type="checkbox"
                  className="checkbox"
                  checked={value.includes(option.value)}
                  onChange={() => {
                    if (value.includes(option.value)) {
                      onUpdate(value.filter((v) => v !== option.value));
                    } else {
                      onUpdate([...value, option.value]);
                    }
                  }}
                />
                <label htmlFor={id}>{option.label}</label>
              </div>
            );
          })}
      </CheckboxesWrapper>
    </>
  );
};
