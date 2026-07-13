import type { ComponentType } from "react";
import type {
  FreeformButtonProps,
  FreeformButtonRowProps,
  FreeformComponentProps,
  FreeformErrorsProps,
  FreeformFieldWrapperProps,
  FreeformInstructionsProps,
  FreeformLabelProps,
  FreeformPageProps,
  FreeformRowProps,
  ReactFieldRendererProps,
} from "../../types.js";
import {
  CheckboxesFieldRenderer,
  CheckboxFieldRenderer,
  EmailFieldRenderer,
  FileFieldRenderer,
  HiddenFieldRenderer,
  HtmlFieldRenderer,
  NumberFieldRenderer,
  PhoneFieldRenderer,
  RadioFieldRenderer,
  SelectFieldRenderer,
  TextareaFieldRenderer,
  TextFieldRenderer,
  UnsupportedFieldRenderer,
} from "./fields.js";

export function DefaultForm({
  className,
  children,
  onSubmit,
}: FreeformComponentProps) {
  return (
    <form className={className} onSubmit={onSubmit} noValidate>
      {children}
    </form>
  );
}

export function DefaultPage({ className, children }: FreeformPageProps) {
  return <div className={className}>{children}</div>;
}

export function DefaultRow({ className, children }: FreeformRowProps) {
  return <div className={className}>{children}</div>;
}

export function DefaultFieldWrapper({
  field,
  form,
  className,
  children,
}: FreeformFieldWrapperProps) {
  if (!form.isFieldVisible(field.handle) && field.type !== "hidden") {
    return null;
  }

  return (
    <div
      className={className}
      data-freeform-field={field.handle}
      data-field-container={field.handle}
      data-field-type={field.type}
      hidden={!form.isFieldVisible(field.handle)}
    >
      {children}
    </div>
  );
}

export function DefaultLabel({
  field,
  className,
  requiredIndicator = "*",
}: FreeformLabelProps) {
  if (!field.label) {
    return null;
  }

  return (
    <label className={className} htmlFor={`freeform-${field.handle}`}>
      {field.label}
      {field.required ? (
        <span aria-hidden="true"> {requiredIndicator}</span>
      ) : null}
    </label>
  );
}

export function DefaultInstructions({
  field,
  className,
}: FreeformInstructionsProps) {
  if (!field.instructions) {
    return null;
  }

  return <div className={className}>{field.instructions}</div>;
}

export function DefaultErrors({
  errors,
  className,
  errorClassName,
}: FreeformErrorsProps) {
  if (!errors.length) {
    return null;
  }

  return (
    <div className={className} role="alert">
      {errors.map((error) => (
        <div key={error} className={errorClassName}>
          {error}
        </div>
      ))}
    </div>
  );
}

export function DefaultButtonRow({
  className,
  children,
}: FreeformButtonRowProps) {
  return <div className={className}>{children}</div>;
}

export function DefaultSubmitButton({
  label,
  className,
  disabled,
  type = "submit",
}: FreeformButtonProps) {
  return (
    <button type={type} className={className} disabled={disabled}>
      {label}
    </button>
  );
}

export function DefaultNextButton(props: FreeformButtonProps) {
  return <DefaultSubmitButton {...props} type="button" />;
}

export function DefaultBackButton(props: FreeformButtonProps) {
  return <DefaultSubmitButton {...props} type="button" />;
}

export function DefaultSuccessMessage({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div className={className} role="status">
      {message}
    </div>
  );
}

export const builtinRenderers = {
  frontend: {} as Record<string, ComponentType<ReactFieldRendererProps>>,
  types: {
    text: TextFieldRenderer,
    textarea: TextareaFieldRenderer,
    email: EmailFieldRenderer,
    number: NumberFieldRenderer,
    phone: PhoneFieldRenderer,
    hidden: HiddenFieldRenderer,
    select: SelectFieldRenderer,
    dropdown: SelectFieldRenderer,
    checkbox: CheckboxFieldRenderer,
    checkboxes: CheckboxesFieldRenderer,
    radio: RadioFieldRenderer,
    radiobox: RadioFieldRenderer,
    file: FileFieldRenderer,
    "file-upload": FileFieldRenderer,
    html: HtmlFieldRenderer,
    "rich-text": HtmlFieldRenderer,
    _unsupported: UnsupportedFieldRenderer,
  } as Record<string, ComponentType<ReactFieldRendererProps>>,
};

export const builtinComponents = {
  Form: DefaultForm,
  Page: DefaultPage,
  Row: DefaultRow,
  FieldWrapper: DefaultFieldWrapper,
  Label: DefaultLabel,
  Instructions: DefaultInstructions,
  Errors: DefaultErrors,
  ButtonRow: DefaultButtonRow,
  SubmitButton: DefaultSubmitButton,
  NextButton: DefaultNextButton,
  BackButton: DefaultBackButton,
  SuccessMessage: DefaultSuccessMessage,
  UnsupportedField: UnsupportedFieldRenderer,
};
