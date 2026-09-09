<script setup lang="ts">
import type { ManifestFieldDefinition } from "@solspace/freeform-core";
import { useFieldExtension } from "../composables/useFieldExtension.js";
import type { FreeformRuntime } from "../types.js";

const props = defineProps<{
  field: ManifestFieldDefinition;
  form: FreeformRuntime;
  class?: string;
  dataAttr: string;
  dataValue?: string;
  hidden?: boolean;
}>();

const hostRef = useFieldExtension(props.field, props.form);

function setHostRef(element: unknown) {
  hostRef.value = (element as HTMLElement | null) ?? null;
}
</script>

<template>
  <div
    :ref="setHostRef"
    :class="props.class"
    :[dataAttr]="dataValue ?? field.handle"
    :hidden="hidden || undefined"
  >
    <slot />
  </div>
</template>
