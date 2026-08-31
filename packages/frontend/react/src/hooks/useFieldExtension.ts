"use client";

import type { ManifestFieldDefinition } from "@solspace/freeform-core";
import { useEffect, useRef } from "react";
import type { FreeformRuntime } from "../types.js";

export function useFieldExtension(
  field: ManifestFieldDefinition,
  form: FreeformRuntime,
): React.RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef(form.mountFieldExtension);
  const isVisibleRef = useRef(form.isFieldVisible);
  mountRef.current = form.mountFieldExtension;
  isVisibleRef.current = form.isFieldVisible;

  const extension = field.frontend?.extension;

  useEffect(() => {
    const element = ref.current;
    if (!element || !extension) {
      return;
    }

    if (!isVisibleRef.current(field.handle)) {
      return;
    }

    return mountRef.current(field.handle, element);
  }, [extension, field.handle]);

  return ref;
}
