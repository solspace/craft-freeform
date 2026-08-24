"use client";

import type { ManifestFieldDefinition } from "@solspace/freeform-core";
import { mergeClassNames } from "../theme/mergeClassNames.js";
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
};

export function FieldRenderer({
  field,
  form,
  theme,
  renderers,
  allowRawHtml,
}: FieldRendererProps) {
  const classNames = theme.classNames ?? {};
  const strategy = theme.classNameStrategy ?? "merge";
  const components = { ...builtinComponents, ...theme.renderers?.components };
  const Renderer = resolveFieldRenderer(field, renderers, theme);
  const errors = form.fieldErrors[field.handle] ?? [];
  const value = form.values[field.handle];
  const isCheckbox = field.type === "checkbox";
  const isPresentational =
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

  const fieldClassName = mergeClassNames(
    strategy,
    classNames.field,
    [
      `ff-field--${toBemModifier(field.type)}`,
      `ff-field--${toBemModifier(field.handle)}`,
      field.required ? classNames.fieldRequired : "",
      errors.length ? classNames.fieldHasErrors : "",
      !form.isFieldVisible(field.handle) || isVisuallyHidden
        ? classNames.fieldHidden
        : "",
    ]
      .filter(Boolean)
      .join(" "),
  );

  const renderLabel = () =>
    !isCheckbox &&
    !isPresentational &&
    !isVisuallyHidden &&
    theme.defaults?.renderLabels !== false ? (
      <components.Label
        field={field}
        className={classNames.label}
        requiredIndicator={theme.defaults?.requiredIndicator}
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

  if (field.type === "group") {
    return (
      <components.FieldWrapper
        field={field}
        form={form}
        className={fieldClassName}
      >
        {renderLabel()}
        {renderInstructions()}
        <div className={classNames.input} data-freeform-group={field.handle}>
          {(field.layout?.rows ?? []).map((row) => (
            <components.Row
              key={row.uid}
              className={mergeClassNames(
                strategy,
                classNames.row,
                `ff-row--${row.fields.length}-fields`,
              )}
            >
              {row.fields.map((handle) => {
                const child = form.manifest.fields[handle];
                if (!child) {
                  return null;
                }

                return (
                  <FieldRenderer
                    key={child.uid}
                    field={child}
                    form={form}
                    theme={theme}
                    renderers={renderers}
                    allowRawHtml={allowRawHtml}
                  />
                );
              })}
            </components.Row>
          ))}
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
      {renderErrors()}
    </components.FieldWrapper>
  );
}
