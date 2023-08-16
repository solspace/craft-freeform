import { useMemo } from 'react';
import type { CustomOptionsConfiguration } from '@components/form-controls/control-types/options/options.types';
import {
  type OptionsConfiguration,
  Source,
} from '@components/form-controls/control-types/options/options.types';
import type { Field } from '@editor/store/slices/layout/fields';
import { type FieldType, Implementation } from '@ff-client/types/fields';
import { PropertyType } from '@ff-client/types/properties';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import template from 'lodash.template';

export const useFieldPreview = (
  field?: Field,
  type?: FieldType
): [string, boolean] => {
  let optionsConfiguration: OptionsConfiguration | undefined;
  if (type?.implements.includes(Implementation.GeneratedOptions)) {
    const optionsProperty = type?.properties.find(
      (property) => property.type === PropertyType.Options
    );

    if (optionsProperty) {
      optionsConfiguration =
        field?.properties[optionsProperty?.handle as string];
    }
  }

  const isCustomOptions = optionsConfiguration?.source === Source.Custom;

  const { data: generatedOptions, isFetching } = useQuery(
    ['options', optionsConfiguration],
    async () => {
      if (!optionsConfiguration || isCustomOptions) {
        return [];
      }

      if (
        optionsConfiguration.source === Source.Elements &&
        !optionsConfiguration.typeClass
      ) {
        return [];
      }

      try {
        const response = await axios.post('api/options', optionsConfiguration);
        const { data } = response;

        return data;
      } catch (error) {
        console.error(error);
        return [];
      }
    },
    { staleTime: Infinity, cacheTime: Infinity }
  );

  const compiledTemplate = useMemo(() => {
    if (
      field?.properties === undefined ||
      type?.previewTemplate === undefined
    ) {
      return 'No preview available';
    }

    const data = {
      ...field.properties,
      generatedOptions: isCustomOptions
        ? (optionsConfiguration as CustomOptionsConfiguration).options
        : generatedOptions ?? [],
    };

    try {
      const compiled = template(type.previewTemplate);
      return compiled(data);
    } catch (error) {
      return `Preview template error: "${error.message}"`;
    }
  }, [field?.properties, type?.previewTemplate, generatedOptions]);

  const isFetchingAsync =
    !!optionsConfiguration && !isCustomOptions && isFetching;

  return [compiledTemplate, isFetchingAsync];
};
