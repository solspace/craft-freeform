import { useEffect, useMemo, useState } from 'react';
import type { OptionsConfiguration } from '@components/form-controls/control-types/options/options.types';
import type { Field } from '@editor/store/slices/layout/fields';
import { type FieldType, Implementation } from '@ff-client/types/fields';
import {
  type OptionCollection,
  PropertyType,
} from '@ff-client/types/properties';
import axios from 'axios';
import template from 'lodash.template';

export const useFieldPreview = (field?: Field, type?: FieldType): string => {
  const [generatedOptions, setGeneratedOpions] = useState<OptionCollection>([]);

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

  useEffect(() => {
    const fetchOptions = async (
      configuration: OptionsConfiguration
    ): Promise<void> => {
      try {
        const response = await axios.post('api/options', configuration);
        const { data } = response;

        setGeneratedOpions(data);
      } catch (error) {
        console.error(error);
        setGeneratedOpions([]);
      }
    };

    if (!optionsConfiguration) {
      return;
    }

    fetchOptions(optionsConfiguration);
  }, [type, optionsConfiguration]);

  return useMemo(() => {
    if (
      field?.properties === undefined ||
      type?.previewTemplate === undefined
    ) {
      return 'No preview available';
    }

    const data = {
      ...field.properties,
      generatedOptions,
    };

    console.log(data);

    try {
      const compiled = template(type.previewTemplate);
      return compiled(data);
    } catch (error) {
      return `Preview template error: "${error.message}"`;
    }
  }, [field?.properties, type?.previewTemplate, generatedOptions]);
};
