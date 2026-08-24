import type { ManifestFieldDefinition } from "@solspace/freeform-core";
import { describe, expect, it } from "vitest";
import { createTheme } from "./defaultTheme.js";
import { resolveThemeClassNames } from "./resolveThemeClassNames.js";

const field: ManifestFieldDefinition = {
  id: 1,
  uid: "uid-1",
  handle: "email",
  type: "email",
  label: "Email",
  required: true,
  frontend: { renderer: "email", extension: null },
};

describe("createTheme", () => {
  it("keeps default BEM classNames when merging", () => {
    const theme = createTheme({
      classNames: { submitButton: "my-submit" },
    });
    expect(theme.classNames?.form).toBe("ff-form");
    expect(theme.classNames?.submitButton).toBe("my-submit");
  });

  it("does not merge BEM classNames when strategy is replace", () => {
    const theme = createTheme({
      classNameStrategy: "replace",
      classNames: { form: "space-y-6", submitButton: "bg-indigo-600" },
    });
    expect(theme.classNames?.form).toBe("space-y-6");
    expect(theme.classNames?.input).toBeUndefined();
    expect(theme.classNames?.submitButton).toBe("bg-indigo-600");
  });
});

describe("resolveThemeClassNames", () => {
  it("overlays type and appends inputError on text fields", () => {
    const theme = createTheme({
      classNameStrategy: "replace",
      classNames: {
        input: "block w-full",
        inputError: "outline-red-600",
      },
      classNamesByType: {
        email: { input: "block w-full rounded-md" },
      },
    });

    const classNames = resolveThemeClassNames(theme, field, true);
    expect(classNames.input).toBe("block w-full rounded-md outline-red-600");
  });

  it("appends inputError onto optionInput for checkboxes", () => {
    const theme = createTheme({
      classNameStrategy: "replace",
      classNames: {
        input: "flex flex-col gap-2",
        optionInput: "size-4",
        inputError: "outline-red-600",
      },
    });

    const classNames = resolveThemeClassNames(
      theme,
      { ...field, type: "checkboxes", handle: "choices" },
      true,
    );
    expect(classNames.input).toBe("flex flex-col gap-2");
    expect(classNames.optionInput).toBe("size-4 outline-red-600");
  });

  it("overlays frontend renderer after field type", () => {
    const theme = createTheme({
      classNameStrategy: "replace",
      classNames: { input: "block" },
      classNamesByType: {
        email: { input: "type-email" },
        "payment.stripe": { input: "stripe-host" },
      },
    });

    const classNames = resolveThemeClassNames(theme, {
      ...field,
      type: "stripe",
      handle: "payment",
      frontend: { renderer: "payment.stripe", extension: "payment.stripe" },
    });
    expect(classNames.input).toBe("stripe-host");
  });
});
