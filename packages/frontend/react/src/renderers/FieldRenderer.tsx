"use client";

import type { ManifestFieldDefinition } from "@solspace/freeform-core";
import { mergeClassNames } from "../theme/mergeClassNames.js";
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
  const fieldClassName = mergeClassNames(
    strategy,
    classNames.field,
    [
      field.required ? classNames.fieldRequired : "",
      errors.length ? classNames.fieldHasErrors : "",
      !form.isFieldVisible(field.handle) ? classNames.fieldHidden : "",
    ]
      .filter(Boolean)
      .join(" "),
  );

  const renderLabel = () =>
    !isCheckbox && theme.defaults?.renderLabels !== false ? (
      <components.Label
        field={field}
        className={classNames.label}
        requiredIndicator={theme.defaults?.requiredIndicator}
      />
    ) : null;

  const renderInstructions = () =>
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

  if (field.type === "hidden") {
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
