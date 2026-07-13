"use client";

import type { ManifestFieldDefinition } from "@solspace/freeform-core";
import { useEffect, useRef } from "react";
import type { FreeformRuntime } from "../types.js";

export function useFieldExtension(
  field: ManifestFieldDefinition,
  form: FreeformRuntime,
): React.RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !field.frontend?.extension) {
      return;
    }

    if (!form.isFieldVisible(field.handle)) {
      return;
    }

    return form.mountFieldExtension(field.handle, element);
  }, [field.frontend?.extension, field.handle, form]);

  return ref;
}
