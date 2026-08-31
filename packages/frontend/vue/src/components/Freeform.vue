<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { useFreeform } from "../composables/useFreeform.js";
import type { UseFreeformOptions } from "../types.js";

const props = defineProps<
  UseFreeformOptions & {
    class?: string;
    loadingMessage?: string;
  }
>();

const attrs = useAttrs();
const form = useFreeform(() => props);

const hasDefaultSlot = computed(() => Boolean(attrs.default || props));

defineSlots<{
  default?: (props: { form: typeof form }) => unknown;
  error?: (props: { error: Error }) => unknown;
  loading?: () => unknown;
}>();

const loadedForm = computed(() => {
  if (!form.manifest) {
    return null;
  }
  return form as typeof form & {
    manifest: NonNullable<typeof form.manifest>;
  };
});
</script>

<template>
  <slot v-if="$slots.default" :form="form" />

  <slot v-else-if="form.loading" name="loading">
    <FormLoader :message="loadingMessage ?? 'Loading form…'" />
  </slot>

  <slot v-else-if="form.error" name="error" :error="form.error">
    <div role="alert">{{ form.error.message }}</div>
  </slot>

  <FreeformView
    v-else-if="loadedForm"
    :form="loadedForm"
    :class="props.class"
  />
</template>
