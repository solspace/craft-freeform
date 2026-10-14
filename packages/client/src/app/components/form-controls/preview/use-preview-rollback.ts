import type { UpdateValue } from "@components/form-controls";
import type { Field } from "@editor/store/slices/layout/fields";
import { useTranslations } from "@editor/store/slices/translations/translations.hooks";
import type { GenericValue } from "@ff-client/types/properties";
import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";
import { useRef } from "react";

export const usePreviewRollback = <T extends GenericValue>(
  value: T,
  updateValue: UpdateValue<T>,
  handle: string,
  context?: unknown,
) => {
  const {
    willTranslate,
    hasTranslation,
    getTranslation,
    updateTranslation,
    removeTranslation,
  } = useTranslations(context as Field);
  const rollback = useRef<(() => void) | undefined>(undefined);
  const current = useRef({ value, hasTranslation, getTranslation });
  current.current = { value, hasTranslation, getTranslation };

  const onEdit = (): void => {
    const original = cloneDeep(value);
    if (willTranslate(handle)) {
      const existed = hasTranslation(handle);
      const translation = cloneDeep(getTranslation<T>(handle, value));
      rollback.current = () => {
        if (existed) {
          if (
            !current.current.hasTranslation(handle) ||
            !isEqual(
              current.current.getTranslation(handle, current.current.value),
              translation,
            )
          ) {
            updateTranslation(handle, translation);
          }
        } else if (current.current.hasTranslation(handle)) {
          removeTranslation(handle);
        }
      };
    } else {
      rollback.current = () => {
        if (!isEqual(current.current.value, original))
          updateValue(cloneDeep(original));
      };
    }
  };

  const onCancel = (): void => rollback.current?.();
  return { onEdit, onCancel };
};
