import type { FreeformReactTheme } from "../types.js";

export const defaultTheme: FreeformReactTheme = {
  name: "default",
  framework: "react",
  classNameStrategy: "merge",
  classNames: {
    form: "ff-form",
    page: "ff-page",
    row: "ff-row",
    field: "ff-field",
    fieldRequired: "ff-field--required",
    fieldHidden: "ff-field--hidden",
    fieldHasErrors: "ff-field--has-errors",
    label: "ff-field__label",
    instructions: "ff-field__instructions",
    input: "ff-field__input",
    content: "ff-field__content",
    errors: "ff-field__errors",
    error: "ff-field__error",
    buttons: "ff-form__buttons",
    button: "ff-button",
    submitButton: "ff-button ff-button--submit",
    nextButton: "ff-button ff-button--next",
    backButton: "ff-button ff-button--back",
    success: "ff-form__success",
  },
  defaults: {
    renderLabels: true,
    renderInstructions: true,
    renderErrors: true,
    requiredIndicator: "*",
    colorScheme: "system",
  },
};

export function createTheme(
  overrides: Partial<FreeformReactTheme>,
): FreeformReactTheme {
  return {
    ...defaultTheme,
    ...overrides,
    classNames: {
      ...defaultTheme.classNames,
      ...overrides.classNames,
    },
    defaults: {
      ...defaultTheme.defaults,
      ...overrides.defaults,
    },
    renderers: {
      ...defaultTheme.renderers,
      ...overrides.renderers,
      handles: {
        ...defaultTheme.renderers?.handles,
        ...overrides.renderers?.handles,
      },
      frontend: {
        ...defaultTheme.renderers?.frontend,
        ...overrides.renderers?.frontend,
      },
      types: {
        ...defaultTheme.renderers?.types,
        ...overrides.renderers?.types,
      },
    },
  };
}
