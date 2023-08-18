import { useMemo } from 'react';
import { useFieldOptions } from '@components/options/use-field-options';
import type { Field } from '@editor/store/slices/layout/fields';
import { type FieldType } from '@ff-client/types/fields';
import template from 'lodash.template';

export const useFieldPreview = (
  field?: Field,
  type?: FieldType
): [string, boolean] => {
  const [generatedOptions, isFetching] = useFieldOptions(field, type);

  const compiledTemplate = useMemo(() => {
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

    try {
      const compiled = template(type.previewTemplate);
      return compiled(data);
    } catch (error) {
      return `Preview template error: "${error.message}"`;
    }
  }, [field?.properties, type?.previewTemplate, generatedOptions]);

  return [compiledTemplate, isFetching];
};
