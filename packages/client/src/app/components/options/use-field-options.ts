import type { CustomOptionsConfiguration } from '@components/form-controls/control-types/options/options.types';
import {
  type OptionsConfiguration,
  Source,
} from '@components/form-controls/control-types/options/options.types';
import type { Field } from '@editor/store/slices/layout/fields';
import { Implementation } from '@ff-client/types/fields';
import {
  type FieldType,
  type OptionCollection,
  PropertyType,
} from '@ff-client/types/properties';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

type FieldOptions = (
  field?: Field,
  type?: FieldType
) => [OptionCollection, boolean];

export const useFieldOptions: FieldOptions = (field, type) => {
  let optionsConfiguration: OptionsConfiguration | undefined;
  if (type?.implements.includes(Implementation.GeneratedOptions)) {
    const optionsProperty = type?.properties.find(
      (property) => property.type === PropertyType.Options
    );

    if (optionsProperty) {
      optionsConfiguration = field?.properties[optionsProperty.handle];
    }
  }

  const isCustomOptions = optionsConfiguration?.source === Source.Custom;

  const { data, isFetching } = useQuery(
    ['field-options', optionsConfiguration],
    async () => {
      if (!optionsConfiguration || isCustomOptions) {
        return [];
      }

      if (
        optionsConfiguration?.source !== Source.Custom &&
        !optionsConfiguration.typeClass
      ) {
        return [];
      }

      try {
        const response = await axios.post<OptionCollection>(
          'api/options',
          optionsConfiguration
        );
        const { data } = response;

        return data;
      } catch (error) {
        console.error(error);
        return [];
      }
    },
    { staleTime: Infinity, cacheTime: Infinity, enabled: !isCustomOptions }
  );

  const isFetchingAsync =
    !!optionsConfiguration && !isCustomOptions && isFetching;

  const options = isCustomOptions
    ? (optionsConfiguration as CustomOptionsConfiguration).options
    : data || [];

  return [options, isFetchingAsync];
};
