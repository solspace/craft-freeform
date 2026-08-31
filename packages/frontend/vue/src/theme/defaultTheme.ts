import type { FreeformThemeClassNames, FreeformVueTheme } from "../types.js";

export const defaultTheme: FreeformVueTheme = {
  name: "default",
  framework: "vue",
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
    saveButton: "ff-button ff-button--save",
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

function mergeClassNamesByType(
  base: FreeformVueTheme["classNamesByType"],
  overlay: FreeformVueTheme["classNamesByType"],
): FreeformVueTheme["classNamesByType"] {
  if (!base && !overlay) {
    return undefined;
  }

  const keys = new Set([
    ...Object.keys(base ?? {}),
    ...Object.keys(overlay ?? {}),
  ]);
  const merged: Record<string, Partial<FreeformThemeClassNames>> = {};

  for (const key of keys) {
    merged[key] = { ...base?.[key], ...overlay?.[key] };
  }

  return merged;
}

export function createTheme(
  overrides: Partial<FreeformVueTheme> = {},
): FreeformVueTheme {
  const strategy =
    overrides.classNameStrategy ?? defaultTheme.classNameStrategy;
  const mergeDefaultClassNames = strategy !== "replace";

  return {
    ...defaultTheme,
    ...overrides,
    classNameStrategy: strategy,
    classNames: mergeDefaultClassNames
      ? {
          ...defaultTheme.classNames,
          ...overrides.classNames,
        }
      : { ...overrides.classNames },
    classNamesByType: mergeClassNamesByType(
      mergeDefaultClassNames ? defaultTheme.classNamesByType : undefined,
      overrides.classNamesByType,
    ),
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
