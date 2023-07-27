import { useMemo } from 'react';
import type { Field } from '@editor/store/slices/layout/fields';
import type { FieldType } from '@ff-client/types/fields';
import template from 'lodash.template';

export const useFieldPreview = (field?: Field, type?: FieldType): string => {
  return useMemo(() => {
    if (
      field?.properties === undefined ||
      type?.previewTemplate === undefined
    ) {
      return 'No preview available';
    }

    try {
      const compiled = template(type.previewTemplate);
      return compiled(field.properties);
    } catch (error) {
      return `Preview template error: "${error.message}"`;
    }
  }, [field?.properties, type?.previewTemplate]);
};
