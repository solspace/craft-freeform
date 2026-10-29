import { ButtonGroup } from "@components/elements/button-group/button-group";
import type { ControlType } from "@components/form-controls/types";
import { IntegrationType } from "@ff-client/types/integrations";
import { type Property, PropertyType } from "@ff-client/types/properties";
import type { ComponentType, ReactNode } from "react";
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Integration } from "../integration.types";
import { EditorInput } from "./editor.input";
import { EditorInputs } from "./editor.inputs";
import type { IntegrationState } from "./editor.types";

vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));
vi.mock("./editor.model-input", () => ({ ModelInput: () => null }));
vi.mock("@editor/store/hooks/value-update-generator", () => ({
  useValueUpdateGenerator:
    (
      _properties: Property[],
      _state: unknown,
      update: (key: string, value: unknown) => void,
    ) =>
    (property: Property) =>
    (value: unknown) =>
      update(property.handle, value),
}));
vi.mock("@components/form-controls/control", () => ({
  Control: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock("@components/form-controls", () => ({
  FormComponent: ({
    property,
    value,
    updateValue,
    control: Custom,
    children,
    context,
  }: ControlType<Property> & {
    control?: ComponentType<ControlType<Property>>;
  }) =>
    Custom ? (
      <Custom
        property={property}
        value={value}
        updateValue={updateValue}
        context={context}
      >
        {children}
      </Custom>
    ) : property.type === PropertyType.ButtonGroup ? (
      <ButtonGroup
        label={property.handle}
        value={value as string}
        options={property.options}
        onClick={updateValue}
      />
    ) : (
      <select
        aria-label={property.handle}
        value={value as string}
        onChange={(event) => updateValue(event.target.value)}
      >
        {property.type === PropertyType.Select && (
          <>
            {property.emptyOption && (
              <option value="">{property.emptyOption}</option>
            )}
            {property.options.map(
              (option) =>
                "value" in option && (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ),
            )}
          </>
        )}
      </select>
    ),
}));

const properties: Property[] = [
  {
    handle: "verificationMode",
    type: PropertyType.Select,
    value: "legacy",
    options: [
      { value: "enterprise", label: "Google Cloud" },
      { value: "legacy", label: "Legacy" },
    ],
  },
  {
    handle: "version",
    type: PropertyType.Select,
    value: "v2-invisible",
    options: [
      { value: "v3", label: "Score Based (v3)" },
      { value: "v2-invisible", label: "Challenge - Invisible (v2)" },
      { value: "v2-checkbox", label: "Challenge - Checkbox (v2)" },
    ],
  },
  {
    handle: "showAdvanced",
    type: PropertyType.Boolean,
    label: "Advanced settings",
    instructions: "Appearance, verification, and developer options.",
    value: false,
  },
  {
    handle: "failureBehavior",
    type: PropertyType.Select,
    label: "Failure Behavior",
    value: "display-error",
    options: [
      { value: "send-to-spam", label: "Send to Spam Folder" },
      { value: "display-error", label: "Display Error Message" },
    ],
  },
  {
    handle: "theme",
    type: PropertyType.Select,
    label: "Theme",
    value: "light",
    visibilityFilters: ["Boolean(enabled)", "Boolean(values.showAdvanced)"],
    options: [
      { value: "light", label: "Light" },
      { value: "dark", label: "Dark" },
    ],
  },
  {
    handle: "scoreThreshold",
    type: PropertyType.Select,
    label: "Score Threshold",
    value: "0.5",
    visibilityFilters: ["Boolean(enabled)", 'values.version === "v3"'],
    options: [],
  },
];
let root: Root;
let container: HTMLDivElement;
function mount(
  mode: string,
  version: string,
  recaptcha = true,
  buttonGroups = false,
  grouped = false,
  id?: number,
  failureBehavior = "display-error",
  providerClass?: string,
  customProperties?: Property[],
) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  const inputs: Property[] =
    customProperties ??
    (buttonGroups
      ? (properties.map((property) =>
          property.type === PropertyType.Select
            ? {
                ...property,
                type: PropertyType.ButtonGroup,
              }
            : property,
        ) as Property[])
      : properties);
  const integration: Integration = {
    id,
    name: "QA",
    handle: "qa",
    enabled: true,
    implements: [],
    properties: inputs,
    type: {
      class:
        providerClass ??
        (recaptcha
          ? "Solspace\\Freeform\\Integrations\\Captchas\\ReCaptcha\\ReCaptcha"
          : "OtherIntegration"),
      shortName: "ReCaptcha",
      name: "reCAPTCHA",
      type: IntegrationType.Captchas,
      nameWithVersion: "reCAPTCHA",
      editions: [],
    },
  };
  const Editor = () => {
    const [values, setValues] = useState<IntegrationState>({
      name: "QA",
      handle: "qa",
      metadata: { verificationMode: mode, version, failureBehavior },
    });
    if (grouped)
      return (
        <EditorInputs
          integration={integration}
          values={values}
          onUpdate={(key, value) =>
            setValues((prev) => ({
              ...prev,
              metadata: { ...prev.metadata, [key]: value },
            }))
          }
        />
      );
    return inputs.map((property) => (
      <EditorInput
        key={property.handle}
        property={property}
        integration={integration}
        values={values}
        onUpdate={(key, value) =>
          setValues((prev) => ({
            ...prev,
            metadata: { ...prev.metadata, [key]: value },
          }))
        }
      />
    ));
  };
  act(() => root.render(<Editor />));
}
const select = (handle: string) =>
  container.querySelector<HTMLSelectElement>(`[aria-label="${handle}"]`)!;
function change(handle: string, value: string) {
  act(() => {
    select(handle).value = value;
    select(handle).dispatchEvent(new Event("change", { bubbles: true }));
  });
}
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
  localStorage.clear();
});

describe("reCAPTCHA setup choices", () => {
  it("remembers open and closed panels when reopening an integration without saving", () => {
    const reopen = () => {
      act(() => root.unmount());
      container.remove();
      mount("legacy", "v3", true, false, true);
    };
    const disclosure = () =>
      container.querySelector<HTMLButtonElement>("button[aria-expanded]")!;
    mount("legacy", "v3", true, false, true);
    act(() => disclosure().click());
    reopen();
    expect(disclosure().getAttribute("aria-expanded")).toBe("true");
    act(() => disclosure().click());
    reopen();
    expect(disclosure().getAttribute("aria-expanded")).toBe("false");
  });
  it("remembers visibility separately for each integration", () => {
    mount("legacy", "v3", true, false, true, 9);
    act(() =>
      container
        .querySelector<HTMLButtonElement>("button[aria-expanded]")!
        .click(),
    );
    act(() => root.unmount());
    container.remove();
    mount("legacy", "v3", true, false, true, 10);
    expect(
      container
        .querySelector("button[aria-expanded]")
        ?.getAttribute("aria-expanded"),
    ).toBe("false");
    act(() => root.unmount());
    container.remove();
    mount("legacy", "v3", true, false, true, 9);
    expect(
      container
        .querySelector("button[aria-expanded]")
        ?.getAttribute("aria-expanded"),
    ).toBe("true");
  });
  it("keeps the panel usable when browser storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Storage blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Storage blocked");
    });
    mount("legacy", "v3", true, false, true);
    const disclosure = container.querySelector<HTMLButtonElement>(
      "button[aria-expanded]",
    )!;
    act(() => disclosure.click());
    expect(disclosure.getAttribute("aria-expanded")).toBe("true");
    act(() => disclosure.click());
    expect(disclosure.getAttribute("aria-expanded")).toBe("false");
  });
  it("keeps the score slider outside advanced settings and retains its edited value", () => {
    mount("legacy", "v3", true, false, true);
    const disclosure = container.querySelector<HTMLButtonElement>(
      "button[aria-expanded]",
    )!;
    const slider = container.querySelector<HTMLInputElement>(
      'input[type="range"]',
    )!;
    expect(container.querySelector('[role="region"]')?.contains(slider)).toBe(
      false,
    );
    expect(disclosure.getAttribute("aria-expanded")).toBe("false");
    expect(slider.getAttribute("aria-label")).toBe("Score Threshold");
    expect(slider.value).toBe("0.5");
    const legend = container.querySelector(
      `[id="${slider.getAttribute("aria-describedby")}"]`,
    )!;
    expect(legend.textContent).toContain("Less strict");
    expect(legend.textContent).toContain("More strict");
    expect(legend.textContent).toContain("Recommended");
    expect(legend.textContent).toContain("Flags fewer submissions");
    expect(legend.textContent).toContain("Flags more submissions");
    act(() => {
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!.call(slider, "0.8");
      slider.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(container.querySelector("output")?.textContent).toBe("0.8");
    act(() => disclosure.click());
    act(() => disclosure.click());
    expect(
      container.querySelector<HTMLInputElement>('input[type="range"]')?.value,
    ).toBe("0.8");
  });
  it("defaults new score-based setups to spam and both v2 types to errors, while respecting manual overrides", () => {
    mount("legacy", "v2-checkbox", true, false, true);
    expect(select("failureBehavior").value).toBe("display-error");
    change("version", "v3");
    expect(select("failureBehavior").value).toBe("send-to-spam");
    change("version", "v2-invisible");
    expect(select("failureBehavior").value).toBe("display-error");
    change("version", "v2-checkbox");
    expect(select("failureBehavior").value).toBe("display-error");
    change("failureBehavior", "send-to-spam");
    change("version", "v2-invisible");
    expect(select("failureBehavior").value).toBe("send-to-spam");
  });
  it.each(["display-error", "send-to-spam"])(
    "preserves a saved %s behavior when changing captcha type",
    (behavior) => {
      mount("legacy", "v3", true, false, true, 9, behavior);
      change("version", "v2-checkbox");
      expect(select("failureBehavior").value).toBe(behavior);
    },
  );
  it("keeps advanced controls inside their expanding panel and preserves edits while collapsed", () => {
    mount("legacy", "v2-checkbox", true, false, true);
    const disclosure = container.querySelector<HTMLButtonElement>(
      "button[aria-expanded]",
    )!;
    const region = container.querySelector<HTMLElement>('[role="region"]')!;
    expect(disclosure.getAttribute("aria-controls")).toBe(region.id);
    expect(region.getAttribute("aria-hidden")).toBe("true");
    expect(region.hasAttribute("inert")).toBe(true);
    act(() => disclosure.click());
    const theme = select("theme");
    expect(region.contains(theme)).toBe(true);
    expect(container.querySelectorAll('[aria-label="theme"]')).toHaveLength(1);
    change("theme", "dark");
    act(() => disclosure.click());
    expect(region.getAttribute("aria-hidden")).toBe("true");
    expect(select("theme")).toBe(theme);
    act(() => disclosure.click());
    expect(region.hasAttribute("inert")).toBe(false);
    expect(select("theme").value).toBe("dark");
  });
  it("expands and collapses advanced controls without clearing other settings", () => {
    mount("legacy", "v2-invisible");
    const disclosure = container.querySelector<HTMLButtonElement>(
      "button[aria-expanded]",
    )!;
    expect(disclosure.textContent).toContain("Advanced settings");
    expect(disclosure.getAttribute("aria-expanded")).toBe("false");
    act(() => disclosure.click());
    expect(disclosure.getAttribute("aria-expanded")).toBe("true");
    change("version", "v3");
    act(() => disclosure.click());
    expect(disclosure.getAttribute("aria-expanded")).toBe("false");
    expect(select("version").value).toBe("v3");
  });
  it("uses guided cards, hides incompatible types, and preserves supported selections", () => {
    mount("legacy", "v2-invisible", true, true);
    const group = (handle: string) =>
      container.querySelector<HTMLElement>(
        `[role="radiogroup"][aria-label="${handle}"]`,
      )!;
    const choice = (handle: string, value: string) =>
      group(handle).querySelector<HTMLInputElement>(`input[value="${value}"]`)!;
    expect(
      Array.from(
        group("verificationMode").querySelectorAll("input"),
        (input) => input.value,
      ),
    ).toEqual(["enterprise", "legacy"]);
    expect(
      Array.from(
        group("version").querySelectorAll("input"),
        (input) => input.value,
      ),
    ).toEqual(["v3", "v2-invisible", "v2-checkbox"]);
    expect(
      choice("verificationMode", "enterprise").closest("label")?.textContent,
    ).toContain("Recommended");
    expect(
      choice("verificationMode", "legacy").closest("label")?.textContent,
    ).not.toContain("Recommended");
    expect(choice("version", "v3").closest("label")?.textContent).toContain(
      "Recommended",
    );
    expect(choice("version", "v2-invisible").checked).toBe(true);
    act(() => choice("verificationMode", "enterprise").click());
    expect(choice("version", "v2-invisible")).toBeNull();
    expect(group("version").querySelector("input:checked")).toBeNull();
    expect(group("verificationMode").textContent).toContain(
      "Use your site key, project ID, and server API key for the Enterprise API.",
    );
    act(() => choice("version", "v3").click());
    act(() => choice("verificationMode", "legacy").click());
    expect(choice("version", "v3").checked).toBe(true);
    expect(choice("version", "v2-invisible")).not.toBeNull();
  });
  it("preserves Invisible v2 in Legacy, clears it when switching to Enterprise, and offers it again in Legacy", () => {
    mount("legacy", "v2-invisible");
    expect(select("version").value).toBe("v2-invisible");
    change("verificationMode", "enterprise");
    expect(
      Array.from(select("version").options, (option) => option.value),
    ).toEqual(["", "v3", "v2-checkbox"]);
    expect(select("version").value).toBe("");
    change("version", "v3");
    change("verificationMode", "legacy");
    expect(select("version").value).toBe("v3");
    change("version", "v2-invisible");
    expect(select("version").selectedOptions[0].text).toBe(
      "Challenge - Invisible (v2)",
    );
  });
  it.each(["v2-checkbox", "v3"])(
    "preserves supported %s selections across setup switches",
    (version) => {
      mount("enterprise", version);
      expect(
        select("version").querySelector('[value="v2-invisible"]'),
      ).toBeNull();
      change("verificationMode", "legacy");
      change("verificationMode", "enterprise");
      expect(select("version").value).toBe(version);
    },
  );
  it("leaves other integrations' version choices unchanged", () => {
    mount("enterprise", "v2-invisible", false);
    expect(select("version").value).toBe("v2-invisible");
    expect(
      select("version").querySelector('[value="v2-invisible"]'),
    ).not.toBeNull();
  });
});

describe("other captcha settings", () => {
  it("keeps theme and size labels and selections usable alongside their icons", () => {
    const display: Property[] = [
      {
        handle: "theme",
        label: "Widget theme",
        type: PropertyType.ButtonGroup,
        value: "auto",
        options: [
          { value: "auto", label: "Auto" },
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
        ],
      },
      {
        handle: "size",
        label: "Widget size",
        type: PropertyType.ButtonGroup,
        value: "normal",
        options: [
          { value: "normal", label: "Normal" },
          { value: "flexible", label: "Flexible" },
          { value: "compact", label: "Compact" },
        ],
      },
    ];
    mount(
      "",
      "",
      false,
      false,
      true,
      12,
      "display-error",
      "Solspace\\Freeform\\Integrations\\Captchas\\Turnstile\\Turnstile",
      display,
    );
    const theme = container.querySelector(
      '[role="group"][aria-label="Widget theme"]',
    )!;
    expect(theme.querySelectorAll('span[aria-hidden="true"] svg')).toHaveLength(
      3,
    );
    const dark = Array.from(theme.querySelectorAll("button")).find(
      (button) => button.textContent === "Dark",
    )!;
    act(() => dark.click());
    expect(dark.getAttribute("aria-pressed")).toBe("true");
    const size = container.querySelector(
      '[role="group"][aria-label="Widget size"]',
    )!;
    const compact = Array.from(size.querySelectorAll("button")).find(
      (button) => button.textContent === "Compact",
    )!;
    act(() => compact.click());
    expect(compact.getAttribute("aria-pressed")).toBe("true");
  });
  const className = (name: string) =>
    `Solspace\\Freeform\\Integrations\\Captchas\\${name}\\${name}`;
  it.each(["hCaptcha", "Turnstile", "FriendlyCaptcha"])(
    "remembers %s's panel without changing saved failure settings",
    (name) => {
      mount(
        "",
        "invisible",
        false,
        false,
        true,
        12,
        "send-to-spam",
        className(name),
      );
      const button = container.querySelector<HTMLButtonElement>(
        "button[aria-expanded]",
      )!;
      expect(button.getAttribute("aria-expanded")).toBe("false");
      act(() => button.click());
      expect(button.getAttribute("aria-expanded")).toBe("true");
      expect(select("failureBehavior").value).toBe("send-to-spam");
      act(() => root.unmount());
      container.remove();
      mount(
        "",
        "invisible",
        false,
        false,
        true,
        12,
        "send-to-spam",
        className(name),
      );
      expect(
        container
          .querySelector("button[aria-expanded]")
          ?.getAttribute("aria-expanded"),
      ).toBe("true");
      expect(select("failureBehavior").value).toBe("send-to-spam");
    },
  );
  it("describes hCaptcha's two types and preserves the saved selection", () => {
    const choices: Property = {
      handle: "version",
      label: "Captcha Type",
      type: PropertyType.ButtonGroup,
      value: "invisible",
      options: [
        { value: "invisible", label: "Invisible" },
        { value: "checkbox", label: "Checkbox" },
      ],
    };
    mount(
      "",
      "invisible",
      false,
      false,
      true,
      12,
      "send-to-spam",
      className("hCaptcha"),
      [choices, properties[2], properties[3]],
    );
    const checkbox = container.querySelector<HTMLInputElement>(
      'input[value="checkbox"]',
    )!;
    expect(container.textContent).toContain("hCaptcha may show a puzzle");
    expect(
      container.querySelector('input[value="invisible"]')?.closest("label")
        ?.textContent,
    ).toContain("Recommended");
    expect(
      container.querySelector('input[value="checkbox"]')?.closest("label")
        ?.textContent,
    ).not.toContain("Recommended");
    expect(
      container.querySelector<HTMLInputElement>('input[value="invisible"]')
        ?.checked,
    ).toBe(true);
    act(() => checkbox.click());
    expect(checkbox.checked).toBe(true);
    expect(select("failureBehavior").value).toBe("send-to-spam");
  });
  it("explains Friendly Captcha start modes without changing the default", () => {
    const start: Property = {
      handle: "startMode",
      label: "Start Mode",
      type: PropertyType.ButtonGroup,
      value: "focus",
      options: [
        { value: "focus", label: "On form focus" },
        { value: "auto", label: "On page load" },
        { value: "none", label: "On request" },
      ],
    };
    mount(
      "",
      "",
      false,
      false,
      true,
      12,
      "display-error",
      className("FriendlyCaptcha"),
      [start, properties[2], properties[3]],
    );
    expect(
      container.querySelector<HTMLInputElement>('input[value="focus"]')
        ?.checked,
    ).toBe(true);
    expect(container.textContent).toContain("Recommended");
    expect(container.textContent).toContain(
      "Freeform also starts it when the form is submitted.",
    );
    act(() =>
      container.querySelector<HTMLInputElement>('input[value="none"]')!.click(),
    );
    expect(
      container.querySelector<HTMLInputElement>('input[value="none"]')?.checked,
    ).toBe(true);
    expect(select("failureBehavior").value).toBe("display-error");
  });
});
