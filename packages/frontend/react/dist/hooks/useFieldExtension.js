"use client";
import { useEffect, useRef } from "react";
export function useFieldExtension(field, form) {
  const ref = useRef(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || !field.frontend?.extension) {
      return;
    }
    if (!form.isFieldVisible(field.handle)) {
      return;
    }
    return form.mountFieldExtension(field.handle, element);
  }, [
    field.frontend?.extension,
    field.handle,
    form,
    form.values[field.handle],
    form.fieldErrors[field.handle],
  ]);
  return ref;
}
