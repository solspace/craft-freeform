<script setup lang="ts">
import { layoutCss, type ManifestFieldDefinition } from "@solspace/freeform-core";
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
import CaptchaHost from "./CaptchaHost.vue";

defineOptions({ name: "FieldRenderer" });

const props = defineProps<{
  field: ManifestFieldDefinition;
  form: FreeformRuntime;
  theme: FreeformVueTheme;
  renderers: RendererOverrides;
  allowRawHtml?: boolean;
  pageFormClassName?: string;
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
const stepPage = computed(() => props.form.manifest.layout?.pages?.[props.form.currentPageIndex]);
const stepRows = computed(() =>
  props.field.type === "form-section" && props.form.currentPageIndex > 0
    ? stepPage.value?.rows ?? []
    : props.field.layout?.rows ?? [],
);
const isLastPage = computed(() => props.form.currentPageIndex >= (props.form.manifest.layout?.pages?.length ?? 0) - 1);
function onSubmit(event: Event) {
  if (props.field.type === "form-section") {
    void props.form.handleSubmit(event);
  }
}

const isCheckbox = computed(() => props.field.type === "checkbox");
const uploadRequirements = computed(() => {
  if (props.field.type !== "file" && props.field.type !== "file-dnd") {
    return "";
  }

  return ((props.field.frontend?.config as { uploadRequirements?: string } | undefined)
    ?.uploadRequirements ?? "");
});
const isPresentational = computed(
  () =>
    ["heading", "divider", "spacer", "callout", "content", "button-link", "video", "icon", "builder-template"].includes(props.field.type) ||
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
    !["layout", "layout-column", "form-section"].includes(props.field.type) &&
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
      v-else-if="['group', 'layout', 'layout-column', 'form-section'].includes(field.type)"
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
        :required-mark-class-name="classNames.requiredMark"
      />
      <component
        :is="components.Instructions"
        v-if="showInstructions"
        :field="field"
        :class="classNames.instructions"
      />
      <component
        :is="field.type === 'form-section' ? components.Form : 'div'"
        v-bind="field.type === 'form-section' ? { form } : {}"
        :class="joinClassNames(classNames.input, field.type === 'form-section' ? pageFormClassName : undefined)"
        :data-freeform-group="field.handle"
        :on-submit="onSubmit"
      >
        <component
          :is="components.Errors"
          v-if="field.type === 'form-section' && form.formErrors.length > 0"
          :errors="form.formErrors"
          :class="theme.classNames?.errors"
          :error-class="theme.classNames?.error"
        />
        <component :is="'style'" v-if="field.type === 'layout'">{{ layoutCss }}</component>
        <component
          :is="field.type === 'layout' ? 'div' : components.Row"
          v-for="row in stepRows"
          :key="row.uid"
          :class="
            joinClassNames(
              field.type === 'layout' ? 'ff-layout-columns' : undefined,
              classNames.row,
              strategy === 'merge'
                ? `ff-row--${row.fields.length}-fields`
                : undefined,
            )
          "
          :data-stack="field.type === 'layout' ? String(field.layout?.stack !== false) : undefined"
          :data-appearance="field.type === 'layout' ? String(!!field.layout?.appearance && Object.keys(field.layout.appearance).length > 0) : undefined"
          :data-cards="field.type === 'layout' ? String(!!field.layout?.cardStyle && Object.keys(field.layout.cardStyle).length > 0) : undefined"
          :style="field.type === 'layout' ? { ...field.layout?.appearance, ...field.layout?.cardStyle, '--freeform-columns': field.layout?.columns ?? '1fr 1fr', '--freeform-vertical-alignment': field.layout?.verticalAlignment ?? 'flex-start', '--freeform-gap': `${field.layout?.gap ?? 16}px` } : undefined"
        >
          <FieldRenderer
            v-for="handle in row.fields"
            :key="handle"
            :field="form.manifest.fields[handle]!"
            :form="form"
            :theme="theme"
            :renderers="renderers"
            :allow-raw-html="allowRawHtml"
            :page-form-class-name="pageFormClassName"
          />
        </component>
        <component v-if="field.type === 'form-section' && stepPage" :is="components.ButtonRow" :class="theme.classNames?.buttons">
        <component v-if="form.currentPageIndex > 0 && stepPage.buttons?.back" :is="components.BackButton" :label="stepPage.buttons.back.label" :class="theme.classNames?.backButton" :disabled="form.isSubmitting" :on-click="() => void form.goBack()" />
        <component v-if="!isLastPage && stepPage.buttons?.submit" :is="components.NextButton" :label="stepPage.buttons.submit.label" :class="theme.classNames?.nextButton" :disabled="form.isSubmitting" :on-click="() => void form.goNext()" />
        <component v-if="isLastPage && stepPage.buttons?.submit" :is="components.SubmitButton" :label="stepPage.buttons.submit.label" :class="theme.classNames?.submitButton" :disabled="form.isSubmitting" />
        <component v-if="stepPage.buttons?.save" :is="components.SaveButton" :label="stepPage.buttons.save.label" :class="theme.classNames?.saveButton" :disabled="form.isSubmitting" :on-click="() => void form.saveDraft()" />
        </component>
        <CaptchaHost
          v-for="captcha in field.type === 'form-section' ? form.manifest.security.captchas ?? [] : []"
          :key="captcha.name"
          :form="form"
          :captcha="captcha"
        />
      </component>
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
        :required-mark-class-name="classNames.requiredMark"
      />
      <component
        :is="components.Instructions"
        v-if="showInstructions"
        :field="field"
        :class="classNames.instructions"
      />
      <component :is="Renderer" v-bind="rendererProps" />
      <div
        v-if="uploadRequirements"
        :id="`freeform-${field.handle}-upload-requirements`"
        :class="['freeform-upload-requirements', classNames.instructions]"
        style="margin-top: 0.375em; margin-bottom: 0; font-size: 0.875em; line-height: 1.4"
      >
        {{ uploadRequirements }}
      </div>
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
