import type { FreeformThemeClassNames } from "@solspace/freeform-react";

/** Text-like controls — Bootstrap 5 utilities from classic `bootstrap-5`. */
export const lightTextInput = "form-control";
export const darkTextInput = "form-control bg-dark-subtle text-white";

export const lightSelectInput = "form-control form-select";
export const darkSelectInput =
  "form-control form-select bg-dark-subtle text-white";

export const lightFileInput = "form-control";
export const darkFileInput = "form-control bg-dark-subtle text-white";

export const lightFileDndInput =
  "form-control d-flex align-items-center justify-content-center text-center";
export const darkFileDndInput =
  "form-control bg-dark-subtle text-white d-flex align-items-center justify-content-center text-center";

export const lightOptionLabel = "form-check";
export const darkOptionLabel = "form-check";

export const lightCheckboxInput = "form-check-input";
export const darkCheckboxInput = "form-check-input bg-dark-subtle";

export const lightRadioInput = "form-check-input";
export const darkRadioInput = "form-check-input bg-dark-subtle";

export const lightChoiceGroup = "d-flex flex-column gap-2";
export const darkChoiceGroup = "d-flex flex-column gap-2";

export const lightPaymentHost = "w-100";
export const darkPaymentHost = "w-100";

export const lightClassNames: FreeformThemeClassNames = {
  form: "freeform-form w-100",
  page: "w-100",
  row: "row g-3",
  field: "col mb-3",
  fieldHidden: "d-none",
  fieldHasErrors: "",
  label: "form-label mb-1",
  instructions: "form-text text-muted mt-n1 mb-1",
  input: lightTextInput,
  inputError: "is-invalid",
  optionLabel: lightOptionLabel,
  optionInput: lightCheckboxInput,
  content: "small text-body-secondary",
  errors: "alert alert-danger",
  error: "list-unstyled m-0 fst-italic text-danger",
  buttons: "mt-2 d-flex flex-wrap gap-2",
  button: "btn",
  submitButton: "btn btn-primary",
  nextButton: "btn btn-primary",
  backButton: "btn btn-secondary",
  saveButton: "btn btn-primary",
  success: "alert alert-success",
};

export const darkClassNames: FreeformThemeClassNames = {
  form: "freeform-form w-100",
  page: "w-100",
  row: "row g-3",
  field: "col mb-3",
  fieldHidden: "d-none",
  fieldHasErrors: "",
  label: "form-label mb-1 text-white",
  instructions: "form-text text-muted mt-n1 mb-1",
  input: darkTextInput,
  inputError: "is-invalid",
  optionLabel: darkOptionLabel,
  optionInput: darkCheckboxInput,
  content: "small text-white-50",
  errors: "alert alert-danger",
  error: "list-unstyled m-0 fst-italic text-danger",
  buttons: "mt-2 d-flex flex-wrap gap-2",
  button: "btn",
  submitButton: "btn btn-primary",
  nextButton: "btn btn-primary",
  backButton: "btn btn-secondary",
  saveButton: "btn btn-primary",
  success: "alert alert-success",
};

const textTypes = [
  "text",
  "textarea",
  "email",
  "number",
  "phone",
  "website",
  "password",
  "regex",
  "datetime",
  "confirm",
  "calculation",
] as const;

function textTypeMap(
  input: string,
): Record<string, Partial<FreeformThemeClassNames>> {
  return Object.fromEntries(textTypes.map((type) => [type, { input }]));
}

export function lightClassNamesByType(): Record<
  string,
  Partial<FreeformThemeClassNames>
> {
  return {
    ...textTypeMap(lightTextInput),
    dropdown: { input: lightSelectInput },
    select: { input: lightSelectInput },
    "multiple-select": { input: lightSelectInput },
    checkbox: {
      input: lightOptionLabel,
      optionLabel: `${lightOptionLabel} d-flex align-items-center gap-2`,
      optionInput: lightCheckboxInput,
    },
    checkboxes: {
      input: lightChoiceGroup,
      optionLabel: `${lightOptionLabel} d-flex align-items-center gap-2`,
      optionInput: lightCheckboxInput,
    },
    radios: {
      input: lightChoiceGroup,
      optionLabel: `${lightOptionLabel} d-flex align-items-center gap-2`,
      optionInput: lightRadioInput,
    },
    radio: {
      input: lightChoiceGroup,
      optionLabel: `${lightOptionLabel} d-flex align-items-center gap-2`,
      optionInput: lightRadioInput,
    },
    radiobox: {
      input: lightChoiceGroup,
      optionLabel: `${lightOptionLabel} d-flex align-items-center gap-2`,
      optionInput: lightRadioInput,
    },
    file: { input: lightFileInput },
    "file-upload": { input: lightFileInput },
    "file-dnd": { input: lightFileDndInput },
    stripe: { input: lightPaymentHost },
    "payment.stripe": { input: lightPaymentHost },
    square: { input: lightPaymentHost },
    "payment.square": { input: lightPaymentHost },
    paypal: { input: lightPaymentHost },
    "payment.paypal": { input: lightPaymentHost },
    mollie: { input: "d-none" },
    html: { content: "small text-body-secondary" },
    "rich-text": { content: "small text-body-secondary" },
    image: { content: "img-fluid" },
    group: { input: "w-100", label: "form-label group-label mb-2" },
    signature: { input: "btn btn-light" },
    table: {
      input: "table-responsive table table-striped table-hover align-middle",
    },
    "opinion-scale": {
      input: "d-flex flex-wrap gap-2",
      optionLabel:
        "freeform-bootstrap-opinion-scale d-flex flex-column align-items-center justify-content-center border border-secondary bg-light text-dark px-3 py-2 text-center user-select-none mb-0",
      optionInput: "visually-hidden",
    },
    rating: {
      input: "d-flex flex-wrap gap-1",
      optionLabel: "btn btn-link p-0 fs-4 text-decoration-none",
      optionInput: "visually-hidden",
    },
    cards: {
      input: "row g-3",
      optionLabel:
        "freeform-bootstrap-card col border rounded p-3 h-100 text-start",
      optionInput: "visually-hidden",
    },
  };
}

export function darkClassNamesByType(): Record<
  string,
  Partial<FreeformThemeClassNames>
> {
  return {
    ...textTypeMap(darkTextInput),
    dropdown: { input: darkSelectInput },
    select: { input: darkSelectInput },
    "multiple-select": { input: darkSelectInput },
    checkbox: {
      input: darkOptionLabel,
      optionLabel: `${darkOptionLabel} d-flex align-items-center gap-2 text-white`,
      optionInput: darkCheckboxInput,
      label: "form-check-label text-white",
    },
    checkboxes: {
      input: darkChoiceGroup,
      optionLabel: `${darkOptionLabel} d-flex align-items-center gap-2 text-white`,
      optionInput: darkCheckboxInput,
    },
    radios: {
      input: darkChoiceGroup,
      optionLabel: `${darkOptionLabel} d-flex align-items-center gap-2 text-white`,
      optionInput: darkRadioInput,
    },
    radio: {
      input: darkChoiceGroup,
      optionLabel: `${darkOptionLabel} d-flex align-items-center gap-2 text-white`,
      optionInput: darkRadioInput,
    },
    radiobox: {
      input: darkChoiceGroup,
      optionLabel: `${darkOptionLabel} d-flex align-items-center gap-2 text-white`,
      optionInput: darkRadioInput,
    },
    file: { input: darkFileInput },
    "file-upload": { input: darkFileInput },
    "file-dnd": { input: darkFileDndInput },
    stripe: { input: darkPaymentHost },
    "payment.stripe": { input: darkPaymentHost },
    square: { input: darkPaymentHost },
    "payment.square": { input: darkPaymentHost },
    paypal: { input: darkPaymentHost },
    "payment.paypal": { input: darkPaymentHost },
    mollie: { input: "d-none" },
    html: { content: "small text-white-50" },
    "rich-text": { content: "small text-white-50" },
    image: { content: "img-fluid" },
    group: { input: "w-100", label: "form-label group-label mb-2 text-white" },
    signature: { input: "btn btn-light" },
    table: {
      input:
        "table-responsive table table-dark table-striped table-hover align-middle",
    },
    "opinion-scale": {
      input: "d-flex flex-wrap gap-2",
      optionLabel:
        "freeform-bootstrap-opinion-scale d-flex flex-column align-items-center justify-content-center border border-secondary bg-dark text-white px-3 py-2 text-center user-select-none mb-0",
      optionInput: "visually-hidden",
    },
    rating: {
      input: "d-flex flex-wrap gap-1",
      optionLabel: "btn btn-link p-0 fs-4 text-decoration-none text-white",
      optionInput: "visually-hidden",
    },
    cards: {
      input: "row g-3",
      optionLabel:
        "freeform-bootstrap-card col border border-secondary bg-dark text-white rounded p-3 h-100 text-start",
      optionInput: "visually-hidden",
    },
  };
}
