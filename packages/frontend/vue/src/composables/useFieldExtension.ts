import type { ManifestFieldDefinition } from "@solspace/freeform-core";
import { onMounted, onUnmounted, ref, watch } from "vue";
import type { FreeformRuntime } from "../types.js";

export function useFieldExtension(
  field: ManifestFieldDefinition,
  form: FreeformRuntime,
) {
  const hostRef = ref<HTMLElement | null>(null);
  let cleanup: (() => void) | undefined;

  function mount() {
    cleanup?.();
    cleanup = undefined;

    const element = hostRef.value;
    if (!element || !field.frontend?.extension) {
      return;
    }

    if (!form.isFieldVisible(field.handle)) {
      return;
    }

    cleanup = form.mountFieldExtension(field.handle, element);
  }

  onMounted(mount);

  watch(
    () => [
      field.frontend?.extension,
      field.handle,
      form.isFieldVisible(field.handle),
    ],
    mount,
  );

  onUnmounted(() => {
    cleanup?.();
  });

  return hostRef;
}
