import React, { useEffect, useState } from 'react';
import { ApiErrorsBlock } from '@components/errors/api-errors';
import { ControlWrapper } from '@components/form-controls/control.styles';
import String from '@components/form-controls/control-types/string/string';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import type { Field } from '@editor/store/slices/layout/fields';
import type { FieldType } from '@ff-client/types/properties';
import { PropertyType } from '@ff-client/types/properties';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import { ButtonContainer, FavoriteFormWrapper } from './favorite.form.styles';
import type { FavoriteMutationResult } from './favorite.queries';

type Props = {
  field: Field;
  type: FieldType;
  mutation: FavoriteMutationResult;
};

export const FavoriteForm: React.FC<Props> = ({ field, type, mutation }) => {
  const [label, setLabel] = useState('');

  useEffect(() => {
    setLabel(field.properties.label || type?.name);
    mutation.reset();
  }, [field.uid]);

  return (
    <FavoriteFormWrapper>
      <ControlWrapper>
        <String
          property={{
            label: translate('Create a favorite'),
            handle: field.properties?.handle,
            flags: [],
            placeholder: field.properties?.label,
            type: PropertyType.String,
          }}
          value={label}
          updateValue={(value) => setLabel(value)}
        />
      </ControlWrapper>
      <ButtonContainer>
        <button
          onClick={() => {
            mutation.mutate({ label, field, type });
          }}
          disabled={mutation.isLoading}
          className={classes(
            'btn fullwidth',
            !mutation.isSuccess && 'submit',
            mutation.isLoading && 'disabled'
          )}
        >
          <LoadingText
            spinner
            loading={mutation.isLoading}
            loadingText="Saving..."
          >
            {translate(mutation.isSuccess ? 'Saved!' : 'Favorite')}
          </LoadingText>
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
