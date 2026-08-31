<script setup lang="ts">
import { computed } from "vue";
import { builtinComponents } from "../renderers/builtin/index.js";
import { joinClassNames } from "../theme/mergeClassNames.js";
import { toBemModifier } from "../theme/toBemModifier.js";
import type { UseFreeformResult } from "../types.js";

const props = defineProps<{
  form: UseFreeformResult & {
    manifest: NonNullable<UseFreeformResult["manifest"]>;
  };
  class?: string;
}>();

const components = computed(() => ({
  ...builtinComponents,
  ...props.form.theme.renderers?.components,
}));

const strategy = computed(() => props.form.theme.classNameStrategy ?? "merge");
const colorScheme = computed(
  () => props.form.theme.defaults?.colorScheme ?? "system",
);

const formClassName = computed(() =>
  joinClassNames(
    props.form.theme.classNames?.form,
    strategy.value === "merge"
      ? `ff-form--${toBemModifier(props.form.manifest.form.handle)}`
      : undefined,
    strategy.value === "merge" &&
      (colorScheme.value === "light" || colorScheme.value === "dark")
      ? `ff-form--${colorScheme.value}`
      : undefined,
    props.class,
  ),
);

const currentPage = computed(
  () =>
    props.form.manifest.layout.pages[props.form.currentPageIndex] ??
    props.form.manifest.layout.pages[0] ?? { rows: [], buttons: {} },
);

const isLastPage = computed(
  () =>
    props.form.manifest.layout.pages.length === 0 ||
    props.form.currentPageIndex >= props.form.manifest.layout.pages.length - 1,
);

const isFirstPage = computed(() => props.form.currentPageIndex === 0);

function hasPresentationalContent(
  field: (typeof props.form.manifest.fields)[string],
): boolean {
  if (field.type === "image") {
    const config = (field.frontend?.config ?? {}) as { src?: string | null };
    const image = (
      field.content as { image?: { src?: string | null } } | undefined
    )?.image;
    return Boolean(image?.src || config.src);
  }

  if (field.type === "html" || field.type === "rich-text") {
    const html = field.content?.rendered?.html?.trim();
    return Boolean((props.form.allowRawHtml && html) || field.instructions);
  }

  return true;
}

function onSubmit(event: Event) {
  void props.form.handleSubmit(event);
}
</script>

<template>
  <component
    :is="components.SuccessMessage"
    v-if="form.isComplete && form.successMessage"
    :message="form.successMessage"
    :class="form.theme.classNames?.success"
  />

  <component
    :is="components.Form"
    v-else
    :form="form"
    :class="formClassName"
    :on-submit="onSubmit"
  >
    <component
      :is="components.Errors"
      v-if="form.formErrors.length > 0"
      :errors="form.formErrors"
      :class="form.theme.classNames?.errors"
      :error-class="form.theme.classNames?.error"
    />

    <component
      :is="components.Page"
      :form="form"
      :page-index="form.currentPageIndex"
      :class="
        joinClassNames(
          form.theme.classNames?.page,
          strategy === 'merge' ? `ff-page--${form.currentPageIndex}` : undefined,
        )
      "
    >
      <template v-for="row in currentPage.rows" :key="row.uid">
        <component
          :is="components.Row"
          v-if="
            row.fields.filter((handle) => {
              const field = form.manifest.fields[handle];
              return field ? hasPresentationalContent(field) : false;
            }).length > 0
          "
          :class="
            joinClassNames(
              form.theme.classNames?.row,
              strategy === 'merge'
                ? `ff-row--${
                    row.fields.filter((handle) => {
                      const field = form.manifest.fields[handle];
                      return field ? hasPresentationalContent(field) : false;
                    }).length
                  }-fields`
                : undefined,
            )
          "
        >
          <FieldRenderer
            v-for="handle in row.fields.filter((handle) => {
              const field = form.manifest.fields[handle];
              return field ? hasPresentationalContent(field) : false;
            })"
            :key="handle"
            :field="form.manifest.fields[handle]!"
            :form="form"
            :theme="form.theme"
            :renderers="form.renderers"
            :allow-raw-html="form.allowRawHtml"
          />
        </component>
      </template>
    </component>

    <CaptchaHost
      v-for="captcha in form.manifest.security.captchas ?? []"
      :key="captcha.name"
      :form="form"
      :captcha="captcha"
    />

    <component :is="components.ButtonRow" :class="form.theme.classNames?.buttons">
      <component
        :is="components.BackButton"
        v-if="!isFirstPage && currentPage.buttons?.back"
        :label="currentPage.buttons.back.label"
        :class="form.theme.classNames?.backButton"
        :disabled="form.isSubmitting"
        :on-click="() => void form.goBack()"
      />

      <component
        :is="components.NextButton"
        v-if="
          form.manifest.settings.multiPage &&
          !isLastPage &&
          currentPage.buttons?.submit
        "
        :label="currentPage.buttons.submit.label"
        :class="form.theme.classNames?.nextButton"
        :disabled="form.isSubmitting"
        :on-click="() => void form.goNext()"
      />

      <component
        :is="components.SubmitButton"
        v-if="
          (!form.manifest.settings.multiPage || isLastPage) &&
          currentPage.buttons?.submit
        "
        :label="currentPage.buttons.submit.label"
        :class="form.theme.classNames?.submitButton"
        :disabled="form.isSubmitting"
      />

      <component
        :is="components.SaveButton"
        v-if="currentPage.buttons?.save"
        :label="currentPage.buttons.save.label"
        :class="form.theme.classNames?.saveButton"
        :disabled="form.isSubmitting"
        :on-click="() => void form.saveDraft()"
      />
    </component>
  </component>
</template>
