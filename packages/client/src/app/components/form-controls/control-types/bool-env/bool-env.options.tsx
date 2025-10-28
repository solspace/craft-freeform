import React, { useMemo } from 'react';
import { useAutosuggestEnvVariables } from '@ff-client/queries/autosuggest';
import type { OptionCollection } from '@ff-client/types/properties';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import { isEnvTrue } from './bool-env.operations';

export const useEnvOptions = (): OptionCollection => {
  const { data } = useAutosuggestEnvVariables();

  return useMemo<OptionCollection>(() => {
    const baseOptions: OptionCollection = [
      {
        label: translate('Yes'),
        value: 'true',
        icon: <span className="status enabled" aria-hidden="true" />,
      },
      {
        label: translate('No'),
        value: 'false',
        icon: <span className="status white" aria-hidden="true" />,
      },
    ];

    const envGroups =
      data?.map((category) => ({
        label: category.label,
        children: category.data.map((item) => ({
          label: item.name,
          value: item.name,
          hint: item.hint,
          icon: (
            <span
              className={classes(
                'status',
                isEnvTrue(item.hint) ? 'enabled' : 'white'
              )}
              aria-hidden="true"
            />
          ),
        })),
      })) ?? [];

    const combined: OptionCollection = [...baseOptions, ...envGroups];

    return combined;
  }, [data]);
};
