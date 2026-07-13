"use client";

import { builtinComponents } from "../renderers/builtin/index.js";
import { FieldRenderer } from "../renderers/FieldRenderer.js";
import { mergeClassNames } from "../theme/mergeClassNames.js";
import type { FreeformRuntime, UseFreeformResult } from "../types.js";

type LoadedFreeformResult = UseFreeformResult & {
  manifest: NonNullable<UseFreeformResult["manifest"]>;
};

type FreeformViewProps = {
  form: LoadedFreeformResult;
  className?: string;
};

function asRuntime(form: LoadedFreeformResult): FreeformRuntime {
  return form;
}

export function FreeformView({ form, className }: FreeformViewProps) {
  const runtime = asRuntime(form);
  const { manifest, theme, renderers, allowRawHtml } = form;
  const components = { ...builtinComponents, ...theme.renderers?.components };
  const strategy = theme.classNameStrategy ?? "merge";
  const formClassName = mergeClassNames(
    strategy,
    theme.classNames?.form,
    className,
  );
  const pages = manifest.layout.pages;
  const currentPage = pages[form.currentPageIndex] ??
    pages[0] ?? { rows: [], buttons: {} };
  const isLastPage =
    pages.length === 0 || form.currentPageIndex >= pages.length - 1;
  const isFirstPage = form.currentPageIndex === 0;

  if (form.isComplete && form.successMessage) {
    return (
      <components.SuccessMessage
        message={form.successMessage}
        className={theme.classNames?.success}
      />
    );
  }

  return (
    <components.Form
      form={runtime}
      className={formClassName}
      onSubmit={form.handleSubmit}
    >
      {form.formErrors.length > 0 ? (
        <components.Errors
          errors={form.formErrors}
          className={theme.classNames?.errors}
          errorClassName={theme.classNames?.error}
        />
      ) : null}

      <components.Page
        form={runtime}
        pageIndex={form.currentPageIndex}
        className={theme.classNames?.page}
      >
        {currentPage.rows.map((row) => (
          <components.Row key={row.uid} className={theme.classNames?.row}>
            {row.fields.map((handle) => {
              const field = manifest.fields[handle];
              if (!field) {
                return null;
              }

              return (
                <FieldRenderer
                  key={field.uid}
                  field={field}
                  form={runtime}
                  theme={theme}
                  renderers={renderers}
                  allowRawHtml={allowRawHtml}
                />
              );
            })}
          </components.Row>
        ))}
      </components.Page>

      <components.ButtonRow className={theme.classNames?.buttons}>
        {!isFirstPage && currentPage.buttons?.back ? (
          <components.BackButton
            label={currentPage.buttons.back.label}
            className={theme.classNames?.backButton}
            disabled={form.isSubmitting}
            onClick={() => void form.goBack()}
          />
        ) : null}

        {manifest.settings.multiPage &&
        !isLastPage &&
        currentPage.buttons?.submit ? (
          <components.NextButton
            label={currentPage.buttons.submit.label}
            className={theme.classNames?.nextButton}
            disabled={form.isSubmitting}
            onClick={() => void form.goNext()}
          />
        ) : null}

        {(!manifest.settings.multiPage || isLastPage) &&
        currentPage.buttons?.submit ? (
          <components.SubmitButton
            label={currentPage.buttons.submit.label}
            className={theme.classNames?.submitButton}
            disabled={form.isSubmitting}
          />
        ) : null}
      </components.ButtonRow>
    </components.Form>
  );
}
