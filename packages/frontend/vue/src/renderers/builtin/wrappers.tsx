import { defineComponent, type PropType } from "vue";
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
  VueFieldRenderer,
  VueFieldRendererProps,
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
  MolliePaymentFieldRenderer,
  MultipleSelectFieldRenderer,
  NumberFieldRenderer,
  OpinionScaleFieldRenderer,
  PasswordFieldRenderer,
  PayPalPaymentFieldRenderer,
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

export const DefaultForm = defineComponent({
  name: "DefaultForm",
  props: {
    form: { type: Object as PropType<FreeformComponentProps["form"]>, required: true },
    class: { type: String, default: undefined },
    onSubmit: {
      type: Function as PropType<FreeformComponentProps["onSubmit"]>,
      required: true,
    },
  },
  setup(props, { slots }) {
    return () => (
      <form class={props.class} onSubmit={props.onSubmit} novalidate>
        {slots.default?.()}
      </form>
    );
  },
});

export const DefaultPage = defineComponent({
  name: "DefaultPage",
  props: {
    form: { type: Object as PropType<FreeformPageProps["form"]>, required: true },
    pageIndex: { type: Number, required: true },
    class: { type: String, default: undefined },
  },
  setup(props, { slots }) {
    return () => <div class={props.class}>{slots.default?.()}</div>;
  },
});

export const DefaultRow = defineComponent({
  name: "DefaultRow",
  props: {
    class: { type: String, default: undefined },
  },
  setup(props, { slots }) {
    return () => <div class={props.class}>{slots.default?.()}</div>;
  },
});

export const DefaultFieldWrapper = defineComponent({
  name: "DefaultFieldWrapper",
  props: {
    field: {
      type: Object as PropType<FreeformFieldWrapperProps["field"]>,
      required: true,
    },
    form: {
      type: Object as PropType<FreeformFieldWrapperProps["form"]>,
      required: true,
    },
    class: { type: String, default: undefined },
  },
  setup(props, { slots }) {
    return () => {
      const isVisuallyHidden =
        props.field.type === "hidden" ||
        props.field.type === "mollie" ||
        props.field.frontend?.renderer === "payment.mollie" ||
        props.field.frontend?.extension === "payment.mollie";

      if (!props.form.isFieldVisible(props.field.handle) && !isVisuallyHidden) {
        return null;
      }

      return (
        <div
          class={props.class}
          data-freeform-field={props.field.handle}
          data-field-container={props.field.handle}
          data-field-type={props.field.type}
          hidden={!props.form.isFieldVisible(props.field.handle) || isVisuallyHidden}
        >
          {slots.default?.()}
        </div>
      );
    };
  },
});

export const DefaultLabel = defineComponent({
  name: "DefaultLabel",
  props: {
    field: { type: Object as PropType<FreeformLabelProps["field"]>, required: true },
    class: { type: String, default: undefined },
    requiredIndicator: { type: String, default: "*" },
  },
  setup(props) {
    return () => {
      if (!props.field.label) {
        return null;
      }

      return (
        <label class={props.class} for={`freeform-${props.field.handle}`}>
          {props.field.label}
          {props.field.required ? (
            <span aria-hidden="true"> {props.requiredIndicator}</span>
          ) : null}
        </label>
      );
    };
  },
});

export const DefaultInstructions = defineComponent({
  name: "DefaultInstructions",
  props: {
    field: {
      type: Object as PropType<FreeformInstructionsProps["field"]>,
      required: true,
    },
    class: { type: String, default: undefined },
  },
  setup(props) {
    return () => {
      if (!props.field.instructions) {
        return null;
      }

      return <div class={props.class}>{props.field.instructions}</div>;
    };
  },
});

export const DefaultErrors = defineComponent({
  name: "DefaultErrors",
  props: {
    errors: { type: Array as PropType<string[]>, required: true },
    class: { type: String, default: undefined },
    errorClass: { type: String, default: undefined },
  },
  setup(props) {
    return () => {
      if (!props.errors.length) {
        return null;
      }

      return (
        <div class={props.class} role="alert">
          {props.errors.map((error) => (
            <div key={error} class={props.errorClass}>
              {error}
            </div>
          ))}
        </div>
      );
    };
  },
});

export const DefaultButtonRow = defineComponent({
  name: "DefaultButtonRow",
  props: {
    class: { type: String, default: undefined },
  },
  setup(props, { slots }) {
    return () => <div class={props.class}>{slots.default?.()}</div>;
  },
});

function buttonComponent(name: string, defaultType: "button" | "submit" = "submit") {
  return defineComponent({
    name,
    props: {
      label: { type: String, required: true },
      class: { type: String, default: undefined },
      disabled: { type: Boolean, default: false },
      type: {
        type: String as PropType<"button" | "submit">,
        default: defaultType,
      },
      onClick: { type: Function as PropType<() => void>, default: undefined },
    },
    setup(props) {
      return () => (
        <button
          type={props.type}
          class={props.class}
          disabled={props.disabled}
          onClick={props.onClick}
        >
          {props.label}
        </button>
      );
    },
  });
}

export const DefaultSubmitButton = buttonComponent("DefaultSubmitButton");
export const DefaultNextButton = buttonComponent("DefaultNextButton", "button");
export const DefaultBackButton = buttonComponent("DefaultBackButton", "button");
export const DefaultSaveButton = buttonComponent("DefaultSaveButton", "button");

export const DefaultSuccessMessage = defineComponent({
  name: "DefaultSuccessMessage",
  props: {
    message: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    return () => (
      <div class={props.class} role="status">
        {props.message}
      </div>
    );
  },
});

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
    "payment.paypal": PayPalPaymentFieldRenderer,
    "payment.mollie": MolliePaymentFieldRenderer,
  } as Record<string, VueFieldRenderer>,
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
    paypal: PayPalPaymentFieldRenderer,
    mollie: MolliePaymentFieldRenderer,
    _unsupported: UnsupportedFieldRenderer,
  } as Record<string, VueFieldRenderer>,
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

export type { VueFieldRendererProps };
