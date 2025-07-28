import React, { useEffect, useRef } from 'react';
import { Control } from '@components/form-controls/control';
import type { ControlType } from '@components/form-controls/types';
import type { StringProperty } from '@ff-client/types/properties';
import classes from '@ff-client/utils/classes';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { Suggestions } from './suggestions/suggestions';

const String: React.FC<ControlType<StringProperty>> = ({
  value,
  property,
  errors,
  updateValue,
  autoFocus,
  context,
}) => {
  const { handle } = property;
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      ref.current?.focus({ preventScroll: true });
    }
  }, [autoFocus]);

  const isCode = property.flags?.includes('code');
  const isReadonly = property.flags?.includes('readonly');
  const isEnvSuggest = property.flags?.includes('env-suggest');

  const { data } = useQuery(
    ['autosuggest', 'env'],
    () => axios.get('/api/autosuggest/env').then((res) => res.data),
    {
      enabled: isEnvSuggest,
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );

  return (
    <Control property={property} errors={errors} context={context}>
      <input
        id={handle}
        ref={ref}
        type="text"
        autoComplete="off"
        data-1p-ignore
        readOnly={isReadonly}
        className={classes(
          'text',
          'fullwidth',
          isCode && 'code',
          isReadonly && 'readonly'
        )}
        value={value ?? ''}
        placeholder={property.placeholder}
        onChange={(event) => updateValue(event.target.value)}
      />
      {isEnvSuggest && !!data && (
        <Suggestions
          inputRef={ref}
          filter={value}
          suggestions={data}
          update={(value) => updateValue(value)}
        />
      )}
    </Control>
  );
};

export default String;
