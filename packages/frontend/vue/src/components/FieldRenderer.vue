<script setup lang="ts">
import type { ManifestFieldDefinition } from "@solspace/freeform-core";
import { computed } from "vue";
import { builtinComponents } from "../renderers/builtin/index.js";
import { resolveFieldRenderer } from "../renderers/resolve.js";
import { joinClassNames } from "../theme/mergeClassNames.js";
import { resolveThemeClassNames } from "../theme/resolveThemeClassNames.js";
import { toBemModifier } from "../theme/toBemModifier.js";
import type {
  FreeformRuntime,
  FreeformVueTheme,
  RendererOverrides,
} from "../types.js";

defineOptions({ name: "FieldRenderer" });

const props = defineProps<{
  field: ManifestFieldDefinition;
  form: FreeformRuntime;
  theme: FreeformVueTheme;
  renderers: RendererOverrides;
  allowRawHtml?: boolean;
}>();

const strategy = computed(() => props.theme.classNameStrategy ?? "merge");
const errors = computed(() => props.form.fieldErrors[props.field.handle] ?? []);
const classNames = computed(() =>
  resolveThemeClassNames(props.theme, props.field, errors.value.length > 0),
);
const components = computed(() => ({
  ...builtinComponents,
  ...props.theme.renderers?.components,
}));
const Renderer = computed(() =>
  resolveFieldRenderer(props.field, props.renderers, props.theme),
);
const value = computed(() => props.form.values[props.field.handle]);

const isCheckbox = computed(() => props.field.type === "checkbox");
const isPresentational = computed(
  () =>
    props.field.type === "html" ||
    props.field.type === "rich-text" ||
    props.field.type === "image",
);
const isVisuallyHidden = computed(
  () =>
    props.field.type === "hidden" ||
    props.field.type === "mollie" ||
    props.field.frontend?.renderer === "payment.mollie" ||
    props.field.frontend?.extension === "payment.mollie",
);

const showLabel = computed(
  () =>
    !isCheckbox.value &&
    !isPresentational.value &&
    !isVisuallyHidden.value &&
    props.theme.defaults?.renderLabels !== false,
);

const showInstructions = computed(
  () =>
    !isPresentational.value &&
    !isVisuallyHidden.value &&
    props.theme.defaults?.renderInstructions !== false,
);

const showErrors = computed(() => props.theme.defaults?.renderErrors !== false);

const shouldRender = computed(() => {
  if (!isPresentational.value) {
    return true;
  }

  if (props.field.type === "image") {
    const config = (props.field.frontend?.config ?? {}) as {
      src?: string | null;
    };
    const image = (
      props.field.content as { image?: { src?: string | null } } | undefined
    )?.image;
    return Boolean(image?.src || config.src);
  }

  const html = props.field.content?.rendered?.html?.trim();
  return Boolean((props.allowRawHtml && html) || props.field.instructions);
});

const fieldClassName = computed(() =>
  joinClassNames(
    classNames.value.field,
    props.field.required ? classNames.value.fieldRequired : undefined,
    errors.value.length ? classNames.value.fieldHasErrors : undefined,
    !props.form.isFieldVisible(props.field.handle) || isVisuallyHidden.value
      ? classNames.value.fieldHidden
      : undefined,
    strategy.value === "merge"
      ? `ff-field--${toBemModifier(props.field.type)}`
      : undefined,
    strategy.value === "merge"
      ? `ff-field--${toBemModifier(props.field.handle)}`
      : undefined,
  ),
);

const rendererProps = computed(() => ({
  field: props.field,
  form: props.form,
  value: value.value,
  errors: errors.value,
  input: props.form.getFieldProps(props.field.handle),
  classNames: classNames.value,
  allowRawHtml: props.allowRawHtml,
  renderLabel: () => null,
  renderInstructions: () => null,
  renderErrors: () => null,
}));
</script>

<template>
  <template v-if="shouldRender">
    <component
      :is="components.FieldWrapper"
      v-if="isVisuallyHidden"
      :field="field"
      :form="form"
      :class="fieldClassName"
    >
      <component :is="Renderer" v-bind="rendererProps" />
    </component>

    <component
      :is="components.FieldWrapper"
      v-else-if="field.type === 'group'"
      :field="field"
      :form="form"
      :class="fieldClassName"
    >
      <component
        :is="components.Label"
        v-if="showLabel"
        :field="field"
        :class="classNames.label"
        :required-indicator="theme.defaults?.requiredIndicator"
      />
      <component
        :is="components.Instructions"
        v-if="showInstructions"
        :field="field"
        :class="classNames.instructions"
      />
      <div :class="classNames.input" :data-freeform-group="field.handle">
        <component
          :is="components.Row"
          v-for="row in field.layout?.rows ?? []"
          :key="row.uid"
          :class="
            joinClassNames(
              classNames.row,
              strategy === 'merge'
                ? `ff-row--${row.fields.length}-fields`
                : undefined,
            )
          "
        >
          <FieldRenderer
            v-for="handle in row.fields"
            :key="handle"
            :field="form.manifest.fields[handle]!"
            :form="form"
            :theme="theme"
            :renderers="renderers"
            :allow-raw-html="allowRawHtml"
          />
        </component>
      </div>
      <component
        :is="components.Errors"
        v-if="showErrors"
        :errors="errors"
        :class="classNames.errors"
        :error-class="classNames.error"
      />
    </component>

    <component
      :is="components.FieldWrapper"
      v-else
      :field="field"
      :form="form"
      :class="fieldClassName"
    >
      <component
        :is="components.Label"
        v-if="showLabel"
        :field="field"
        :class="classNames.label"
        :required-indicator="theme.defaults?.requiredIndicator"
      />
      <component
        :is="components.Instructions"
        v-if="showInstructions"
        :field="field"
        :class="classNames.instructions"
      />
      <component :is="Renderer" v-bind="rendererProps" />
      <component
        :is="components.Errors"
        v-if="showErrors"
        :errors="errors"
        :class="classNames.errors"
        :error-class="classNames.error"
      />
    </component>
  </template>
</template>
