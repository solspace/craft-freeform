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
import { CalculationFieldRenderer } from "./CalculationField.js";
import {
  CardsFieldRenderer,
  CheckboxesFieldRenderer,
  CheckboxFieldRenderer,
  ConfirmFieldRenderer,
  DatetimeFieldRenderer,
  EmailFieldRenderer,
  FileDndFieldRenderer,
  FileFieldRenderer,
  HiddenFieldRenderer,
  HtmlFieldRenderer,
  ImageFieldRenderer,
  MultipleSelectFieldRenderer,
  NumberFieldRenderer,
  OpinionScaleFieldRenderer,
  PasswordFieldRenderer,
  PhoneFieldRenderer,
  RadioFieldRenderer,
  RatingFieldRenderer,
  RegexFieldRenderer,
  SelectFieldRenderer,
  SquarePaymentFieldRenderer,
  StripePaymentFieldRenderer,
  TextareaFieldRenderer,
  TextFieldRenderer,
  UnsupportedFieldRenderer,
  WebsiteFieldRenderer,
} from "./fields.js";
import { SignatureFieldRenderer } from "./SignatureField.js";
import { TableFieldRenderer } from "./TableField.js";

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
  onClick,
}: FreeformButtonProps) {
  return (
    <button
      type={type}
      className={className}
      disabled={disabled}
      onClick={onClick}
    >
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

export function DefaultSaveButton(props: FreeformButtonProps) {
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
  frontend: {
    text: TextFieldRenderer,
    textarea: TextareaFieldRenderer,
    email: EmailFieldRenderer,
    number: NumberFieldRenderer,
    phone: PhoneFieldRenderer,
    website: WebsiteFieldRenderer,
    regex: RegexFieldRenderer,
    password: PasswordFieldRenderer,
    confirm: ConfirmFieldRenderer,
    hidden: HiddenFieldRenderer,
    dropdown: SelectFieldRenderer,
    select: SelectFieldRenderer,
    "multiple-select": MultipleSelectFieldRenderer,
    checkbox: CheckboxFieldRenderer,
    checkboxes: CheckboxesFieldRenderer,
    radios: RadioFieldRenderer,
    radio: RadioFieldRenderer,
    "opinion-scale": OpinionScaleFieldRenderer,
    rating: RatingFieldRenderer,
    cards: CardsFieldRenderer,
    datetime: DatetimeFieldRenderer,
    file: FileFieldRenderer,
    "file-upload": FileFieldRenderer,
    "file-dnd": FileDndFieldRenderer,
    html: HtmlFieldRenderer,
    "rich-text": HtmlFieldRenderer,
    image: ImageFieldRenderer,
    table: TableFieldRenderer,
    signature: SignatureFieldRenderer,
    calculation: CalculationFieldRenderer,
    "payment.stripe": StripePaymentFieldRenderer,
    "payment.square": SquarePaymentFieldRenderer,
  } as Record<string, ComponentType<ReactFieldRendererProps>>,
  types: {
    text: TextFieldRenderer,
    textarea: TextareaFieldRenderer,
    email: EmailFieldRenderer,
    number: NumberFieldRenderer,
    phone: PhoneFieldRenderer,
    website: WebsiteFieldRenderer,
    regex: RegexFieldRenderer,
    password: PasswordFieldRenderer,
    confirm: ConfirmFieldRenderer,
    hidden: HiddenFieldRenderer,
    select: SelectFieldRenderer,
    dropdown: SelectFieldRenderer,
    "multiple-select": MultipleSelectFieldRenderer,
    checkbox: CheckboxFieldRenderer,
    checkboxes: CheckboxesFieldRenderer,
    radio: RadioFieldRenderer,
    radios: RadioFieldRenderer,
    radiobox: RadioFieldRenderer,
    "opinion-scale": OpinionScaleFieldRenderer,
    rating: RatingFieldRenderer,
    cards: CardsFieldRenderer,
    datetime: DatetimeFieldRenderer,
    file: FileFieldRenderer,
    "file-upload": FileFieldRenderer,
    "file-dnd": FileDndFieldRenderer,
    html: HtmlFieldRenderer,
    "rich-text": HtmlFieldRenderer,
    image: ImageFieldRenderer,
    table: TableFieldRenderer,
    signature: SignatureFieldRenderer,
    calculation: CalculationFieldRenderer,
    stripe: StripePaymentFieldRenderer,
    square: SquarePaymentFieldRenderer,
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
  SaveButton: DefaultSaveButton,
  SuccessMessage: DefaultSuccessMessage,
  UnsupportedField: UnsupportedFieldRenderer,
};
