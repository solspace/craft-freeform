import React, { useEffect, useState } from 'react';
import { ApiErrorsBlock } from '@components/errors/api-errors';
import { Field as FieldInput } from '@components/form-controls/controls/base-control.styles';
import type { Field } from '@editor/store/slices/fields';
import type { FieldType } from '@ff-client/types/properties';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import { Label } from '../form-controls/control.styles';

import { ButtonContainer, FavoriteFormWrapper } from './favorite.form.styles';
import type { FavoriteMutationResult } from './favorite.queries';

type Props = {
  field: Field;
  type: FieldType;
  mutation: FavoriteMutationResult;
};

export const FavoriteForm: React.FC<Props> = ({ field, type, mutation }) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue(field.properties.label || type.name);
    mutation.reset();
  }, [field.uid]);

  return (
    <FavoriteFormWrapper>
      <FieldInput>
        <Label>{translate('Create a favorite')}</Label>
        <input
          type="text"
          className="text fullwidth"
          placeholder={field.properties?.label}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </FieldInput>
      <ButtonContainer>
        <button
          onClick={() => {
            mutation.mutate({ field, type });
          }}
          disabled={mutation.isLoading}
          className={classes(
            'btn fullwidth',
            !mutation.isSuccess && 'submit',
            mutation.isLoading && 'disabled'
          )}
        >
          {translate(mutation.isSuccess ? 'Saved!' : 'Favorite')}
        </button>
      </ButtonContainer>

      {mutation.isError && (
        <ApiErrorsBlock
          category="favorites"
          handle="name"
          error={mutation.error}
        />
      )}
    </FavoriteFormWrapper>
  );
};
