"use client";

import {
  layoutCss,
  type ManifestFieldDefinition,
} from "@solspace/freeform-core";
import type { CSSProperties } from "react";
import { CaptchaHost } from "../components/CaptchaHost.js";
import { joinClassNames } from "../theme/mergeClassNames.js";
import { resolveThemeClassNames } from "../theme/resolveThemeClassNames.js";
import { toBemModifier } from "../theme/toBemModifier.js";
import type {
  FreeformReactTheme,
  FreeformRuntime,
  RendererOverrides,
} from "../types.js";
import { builtinComponents } from "./builtin/index.js";
import { resolveFieldRenderer } from "./resolve.js";

type FieldRendererProps = {
  field: ManifestFieldDefinition;
  form: FreeformRuntime;
  theme: FreeformReactTheme;
  renderers: RendererOverrides;
  allowRawHtml?: boolean;
  pageFormClassName?: string;
  pageFormStyle?: CSSProperties;
};

export function FieldRenderer({
  field,
  form,
  theme,
  renderers,
  allowRawHtml,
  pageFormClassName,
  pageFormStyle,
}: FieldRendererProps) {
  const strategy = theme.classNameStrategy ?? "merge";
  const errors = form.fieldErrors[field.handle] ?? [];
  const classNames = resolveThemeClassNames(theme, field, errors.length > 0);
  const components = { ...builtinComponents, ...theme.renderers?.components };
  const Renderer = resolveFieldRenderer(field, renderers, theme);
  const value = form.values[field.handle];
  const isCheckbox = field.type === "checkbox";
  const uploadRequirements =
    field.type === "file" || field.type === "file-dnd"
      ? ((field.frontend?.config as { uploadRequirements?: string } | undefined)
          ?.uploadRequirements ?? "")
      : "";
  const isPresentational =
    [
      "heading",
      "divider",
      "spacer",
      "callout",
      "content",
      "button-link",
      "video",
      "icon",
      "builder-template",
    ].includes(field.type) ||
    field.type === "html" ||
    field.type === "rich-text" ||
    field.type === "image";
  const isVisuallyHidden =
    field.type === "hidden" ||
    field.type === "mollie" ||
    field.frontend?.renderer === "payment.mollie" ||
    field.frontend?.extension === "payment.mollie";

  // Skip empty presentational fields so they don't leave blank bordered rows.
  if (isPresentational) {
    if (field.type === "image") {
      const config = (field.frontend?.config ?? {}) as {
        src?: string | null;
      };
      const image = (
        field.content as { image?: { src?: string | null } } | undefined
      )?.image;
      if (!(image?.src || config.src)) {
        return null;
      }
    } else {
      const html = field.content?.rendered?.html?.trim();
      if (!(allowRawHtml && html) && !field.instructions) {
        return null;
      }
    }
  }

  const fieldClassName = joinClassNames(
    classNames.field,
    field.required ? classNames.fieldRequired : undefined,
    errors.length ? classNames.fieldHasErrors : undefined,
    !form.isFieldVisible(field.handle) || isVisuallyHidden
      ? classNames.fieldHidden
      : undefined,
    strategy === "merge" ? `ff-field--${toBemModifier(field.type)}` : undefined,
    strategy === "merge"
      ? `ff-field--${toBemModifier(field.handle)}`
      : undefined,
  );

  const renderLabel = () =>
    !["layout", "layout-column", "form-section"].includes(field.type) &&
    !isCheckbox &&
    !isPresentational &&
    !isVisuallyHidden &&
    theme.defaults?.renderLabels !== false ? (
      <components.Label
        field={field}
        className={classNames.label}
        requiredIndicator={theme.defaults?.requiredIndicator}
        requiredMarkClassName={classNames.requiredMark}
      />
    ) : null;

  const renderInstructions = () =>
    !isPresentational &&
    !isVisuallyHidden &&
    theme.defaults?.renderInstructions !== false ? (
      <components.Instructions
        field={field}
        className={classNames.instructions}
      />
    ) : null;

  const renderErrors = () =>
    theme.defaults?.renderErrors !== false ? (
      <components.Errors
        errors={errors}
        className={classNames.errors}
        errorClassName={classNames.error}
      />
    ) : null;

  if (isVisuallyHidden) {
    return (
      <components.FieldWrapper
        field={field}
        form={form}
        className={fieldClassName}
      >
        <Renderer
          field={field}
          form={form}
          value={value}
          errors={errors}
          input={form.getFieldProps(field.handle)}
          classNames={classNames}
          allowRawHtml={allowRawHtml}
          renderLabel={renderLabel}
          renderInstructions={renderInstructions}
          renderErrors={renderErrors}
        />
      </components.FieldWrapper>
    );
  }

  if (
    ["group", "layout", "layout-column", "form-section"].includes(field.type)
  ) {
    const GroupRow: React.ElementType =
      field.type === "layout" ? "div" : components.Row;
    const pages = form.manifest.layout?.pages ?? [];
    const page = pages[form.currentPageIndex];
    const stepRows =
      field.type === "form-section" && form.currentPageIndex > 0
        ? (page?.rows ?? [])
        : (field.layout?.rows ?? []);
    const isLastPage = form.currentPageIndex >= pages.length - 1;
    const groupContent = (
      <>
        {field.type === "layout" && <style>{layoutCss}</style>}
        {stepRows.map((row) => (
          <GroupRow
            key={row.uid}
            className={joinClassNames(
              field.type === "layout" ? "ff-layout-columns" : undefined,
              classNames.row,
              strategy === "merge"
                ? `ff-row--${row.fields.length}-fields`
                : undefined,
            )}
            data-stack={
              field.type === "layout"
                ? String(field.layout?.stack !== false)
                : undefined
            }
            data-appearance={
              field.type === "layout"
                ? String(
                    !!field.layout?.appearance &&
                      Object.keys(field.layout.appearance).length > 0,
                  )
                : undefined
            }
            data-cards={
              field.type === "layout"
                ? String(
                    !!field.layout?.cardStyle &&
                      Object.keys(field.layout.cardStyle).length > 0,
                  )
                : undefined
            }
            style={
              field.type === "layout"
                ? ({
                    ...field.layout?.appearance,
                    ...field.layout?.cardStyle,
                    "--freeform-columns": field.layout?.columns ?? "1fr 1fr",
                    "--freeform-vertical-alignment":
                      field.layout?.verticalAlignment ?? "flex-start",
                    "--freeform-gap": `${field.layout?.gap ?? 16}px`,
                  } as CSSProperties)
                : undefined
            }
          >
            {row.fields.map((handle) => {
              const child = form.manifest.fields[handle];
              return child ? (
                <FieldRenderer
                  key={child.uid}
                  field={child}
                  form={form}
                  theme={theme}
                  renderers={renderers}
                  allowRawHtml={allowRawHtml}
                  pageFormClassName={pageFormClassName}
                  pageFormStyle={pageFormStyle}
                />
              ) : null;
            })}
          </GroupRow>
        ))}
        {field.type === "form-section" && page && (
          <components.ButtonRow className={theme.classNames?.buttons}>
            {form.currentPageIndex > 0 && page.buttons?.back && (
              <components.BackButton
                label={page.buttons.back.label}
                className={theme.classNames?.backButton}
                disabled={form.isSubmitting}
                onClick={() => void form.goBack()}
              />
            )}
            {!isLastPage && page.buttons?.submit && (
              <components.NextButton
                label={page.buttons.submit.label}
                className={theme.classNames?.nextButton}
                disabled={form.isSubmitting}
                onClick={() => void form.goNext()}
              />
            )}
            {isLastPage && page.buttons?.submit && (
              <components.SubmitButton
                label={page.buttons.submit.label}
                className={theme.classNames?.submitButton}
                disabled={form.isSubmitting}
              />
            )}
            {page.buttons?.save && (
              <components.SaveButton
                label={page.buttons.save.label}
                className={theme.classNames?.saveButton}
                disabled={form.isSubmitting}
                onClick={() => void form.saveDraft()}
              />
            )}
          </components.ButtonRow>
        )}
      </>
    );
    return (
      <components.FieldWrapper
        field={field}
        form={form}
        className={fieldClassName}
      >
        {renderLabel()}
        {renderInstructions()}
        <div className={classNames.input} data-freeform-group={field.handle}>
          {field.type === "form-section" ? (
            <components.Form
              form={form}
              className={pageFormClassName}
              style={pageFormStyle}
              onSubmit={form.handleSubmit}
            >
              {form.formErrors.length > 0 && (
                <components.Errors
                  errors={form.formErrors}
                  className={theme.classNames?.errors}
                  errorClassName={theme.classNames?.error}
                />
              )}
              {groupContent}
              {(form.manifest.security.captchas ?? []).map((captcha) => (
                <CaptchaHost key={captcha.name} form={form} captcha={captcha} />
              ))}
            </components.Form>
          ) : (
            groupContent
          )}
        </div>
        {renderErrors()}
      </components.FieldWrapper>
    );
  }

  return (
    <components.FieldWrapper
      field={field}
      form={form}
      className={fieldClassName}
    >
      {renderLabel()}
      {renderInstructions()}
      <Renderer
        field={field}
        form={form}
        value={value}
        errors={errors}
        input={form.getFieldProps(field.handle)}
        classNames={classNames}
        allowRawHtml={allowRawHtml}
        renderLabel={renderLabel}
        renderInstructions={renderInstructions}
        renderErrors={renderErrors}
      />
      {uploadRequirements && (
        <div
          id={`freeform-${field.handle}-upload-requirements`}
          className={joinClassNames(
            "freeform-upload-requirements",
            classNames.instructions,
          )}
          style={{
            marginTop: "0.375em",
            marginBottom: 0,
            fontSize: "0.875em",
            lineHeight: 1.4,
          }}
        >
          {uploadRequirements}
        </div>
      )}
      {renderErrors()}
    </components.FieldWrapper>
  );
}
