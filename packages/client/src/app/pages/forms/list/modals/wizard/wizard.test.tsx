import axios from "axios";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import Sortable, { type MoveEvent, type SortableEvent } from "sortablejs";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { FormWizardModal } from "./wizard";
import {
  fieldRows,
  normalizeRows,
  placeField,
  type WizardDraft,
  type WizardOptions,
} from "./wizard.types";

const fixture = vi.hoisted(() => ({
  close: vi.fn(),
  navigate: vi.fn(),
  change: vi.fn(),
  invalidate: vi.fn(),
  refetch: vi.fn(),
  loadError: false,
  options: null as WizardOptions | null,
  draft: null as WizardDraft | null,
  sitesEnabled: false,
  siteCount: 2,
}));
vi.mock("./wizard.builder", () => ({
  WizardBuilder: ({ draft }: { draft: WizardDraft }): null => {
    fixture.draft = draft;
    return null;
  },
  useWizardBuilderScreen: () => false,
}));
vi.mock("@ff-client/queries/field-types", () => ({
  useFetchFieldTypes: (): { data: unknown[] } => ({ data: [] }),
}));
vi.mock("axios", () => ({ default: { get: vi.fn(), post: vi.fn() } }));
vi.mock(
  "@components/form-controls/preview/previewable-component.animations",
  () => ({
    useEditorAnimations: () => ({ editorAnimation: {} }),
  }),
);
vi.mock("@config/freeform/freeform.config", () => ({
  default: {
    metadata: { craft: { is: { atLeast: () => true } } },
    sites: {
      current: 1,
      get enabled() {
        return fixture.sitesEnabled;
      },
      get list() {
        return [
          { id: 1, name: "English", handle: "default" },
          { id: 2, name: "French", handle: "fr" },
        ].slice(0, fixture.siteCount);
      },
    },
  },
}));
vi.mock("@ff-client/contexts/site/site.context", () => ({
  useSiteContext: () => ({
    current: { id: 1 },
    change: fixture.change,
    getCurrentHandleWithFallback: () => "default",
  }),
}));
vi.mock("@ff-client/queries/forms", () => ({
  QKForms: { all: (site: string) => ["forms", site] },
}));
vi.mock("@ff-client/queries/form-groups", () => ({
  QKGroups: { all: (site: string) => ["groups", site] },
}));
vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({
    data: fixture.options,
    isError: fixture.loadError,
    refetch: fixture.refetch,
  }),
  useQueryClient: () => ({ invalidateQueries: fixture.invalidate }),
}));
vi.mock("react-router-dom", () => ({ useNavigate: () => fixture.navigate }));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string, params: Record<string, string> = {}) =>
    text.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? key)),
}));

let root: Root;
let host: HTMLDivElement;
const originalScrollIntoView = Element.prototype.scrollIntoView;
function button(text: string) {
  return Array.from(host.querySelectorAll("button")).find(
    (button) => button.textContent === text,
  )!;
}
const click = (text: string) => act(() => button(text).click());
function type(selector: string, value: string) {
  const input = host.querySelector<HTMLInputElement>(selector)!;
  act(() => {
    Object.getOwnPropertyDescriptor(
      input.tagName === "TEXTAREA"
        ? HTMLTextAreaElement.prototype
        : input.tagName === "SELECT"
          ? HTMLSelectElement.prototype
          : HTMLInputElement.prototype,
      "value",
    )!.set!.call(input, value);
    input.dispatchEvent(
      new Event(input.tagName === "SELECT" ? "change" : "input", {
        bubbles: true,
      }),
    );
  });
}

function enableAdvancedSettings(editable = true) {
  fixture.options!.defaults = {
    ...fixture.options!.defaults,
    description: "Internal notes",
    color: "#123456",
    defaultStatus: "1",
  };
  fixture.options!.statuses = [
    { value: "1", label: "New", color: "#123456" },
    { value: "2", label: "Reviewed", color: "#abcdef" },
  ];
  if (editable)
    fixture.options!.editableSettings.push(
      "handle",
      "description",
      "color",
      "defaultStatus",
    );
  act(() => root.unmount());
  root = createRoot(host);
  act(() => root.render(<FormWizardModal closeModal={fixture.close} />));
  click("ContactA contact form");
  continueStep();
}

it.each([false, true])(
  "prefills an internal form description and preserves a custom description (%s)",
  (customize) => {
    fixture.options!.editableSettings.push("description");
    click("ContactA contact form");
    continueStep();
    expect(
      host.querySelector<HTMLTextAreaElement>(".wizard-editor textarea")!.value,
    ).toBe("General website inquiries for team follow-up.");
    expect(
      host
        .querySelector<HTMLTextAreaElement>(".wizard-editor textarea")!
        .closest("details"),
    ).toBeNull();
    expect(
      host
        .querySelector<HTMLElement>(".wizard-status-picker")!
        .closest("details"),
    ).toBeNull();
    expect(
      host
        .querySelector<HTMLInputElement>(".wizard-color-control input")!
        .closest("details"),
    ).toBeNull();
    if (customize)
      type(".wizard-editor textarea", "Custom internal description");
    act(() =>
      host.querySelector<HTMLButtonElement>('[aria-label="Purpose"]')!.click(),
    );
    click("FeedbackA feedback form");
    click("Replace fields");
    continueStep();
    expect(
      host.querySelector<HTMLTextAreaElement>(".wizard-editor textarea")!.value,
    ).toBe(
      customize
        ? "Custom internal description"
        : "Customer feedback for internal review and service improvements.",
    );
  },
);

it("keeps Advanced collapsed and carries its settings through creation", async () => {
  enableAdvancedSettings();
  const panel = host.querySelector<HTMLDetailsElement>(".wizard-advanced")!;
  expect(panel.open).toBe(false);
  await act(async () => {
    panel.querySelector("summary")!.click();
    await vi.advanceTimersByTimeAsync(0);
  });
  expect(panel.open).toBe(true);
  type(".wizard-editor input:not([type])", "Project inquiry");
  expect(
    host.querySelector<HTMLInputElement>(".wizard-advanced input")!.value,
  ).toBe("projectInquiry");
  type(".wizard-advanced input", "customInquiry");
  type(".wizard-editor input:not([type])", "Updated inquiry");
  expect(
    host.querySelector<HTMLInputElement>(".wizard-advanced input")!.value,
  ).toBe("customInquiry");
  type(".wizard-editor textarea", "Notes for the team");
  type(".wizard-color-control input:not([type=color])", "#abcdef");
  const statusPicker = host.querySelector<HTMLElement>(
    '[aria-label="Default Status"]',
  )!;
  await act(async () =>
    statusPicker.dispatchEvent(
      new KeyboardEvent("keyup", { key: "Enter", bubbles: true }),
    ),
  );
  const reviewed = document.querySelector<HTMLElement>(
    '.dropdown-rollout [data-value="2"]',
  )!;
  expect(reviewed.querySelector("svg circle")?.getAttribute("fill")).toBe(
    "#abcdef",
  );
  await act(async () => reviewed.click());
  for (let step = 1; step < 6; step++) continueStep();
  await act(async () => button("Create form").click());
  expect(axios.post).toHaveBeenCalledWith(
    "/api/forms/wizard/create",
    expect.objectContaining({
      handle: "customInquiry",
      description: "Notes for the team",
      color: "#abcdef",
      defaultStatus: "2",
    }),
  );
}, 15000);

it("disables Advanced controls restricted by defaults or Limited Users", () => {
  enableAdvancedSettings(false);
  const controls = host.querySelectorAll<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >(
    ".wizard-advanced input, .wizard-editor textarea, .wizard-color-control input",
  );
  expect(controls.length).toBe(4);
  expect(Array.from(controls).every((control) => control.disabled)).toBe(true);
  expect(
    host.querySelector<HTMLInputElement>(
      ".wizard-color-control input:not([type=color])",
    )!.value,
  ).toBe("#123456");
  expect(
    host
      .querySelector<HTMLElement>('[aria-label="Default Status"]')!
      .getAttribute("aria-disabled"),
  ).toBe("true");
});

it("opens Advanced and marks invalid handles and colors when continuing", () => {
  enableAdvancedSettings();
  type(".wizard-advanced input", "invalid handle!");
  type(".wizard-color-control input:not([type=color])", "#oops");
  continueStep();
  expect(host.querySelector<HTMLDetailsElement>(".wizard-advanced")!.open).toBe(
    true,
  );
  expect(
    host.querySelectorAll(".wizard-editor [aria-invalid=true]"),
  ).toHaveLength(2);
});

it("keeps Behavior defaults and locks for messages, redirects, and stored submissions", () => {
  fixture.options!.defaults = {
    ...fixture.options!.defaults,
    successBehavior: "redirect-return-url",
    returnUrl: "/thank-you",
    errorMessage: "Configured error",
    storeData: true,
  };
  fixture.options!.editableSettings = [];
  act(() => root.unmount());
  root = createRoot(host);
  act(() => root.render(<FormWizardModal closeModal={fixture.close} />));
  click("ContactA contact form");
  for (let step = 0; step < 4; step++) continueStep();
  const select = host.querySelector<HTMLSelectElement>(
    ".wizard-editor select",
  )!;
  expect(select.value).toBe("redirect-return-url");
  expect(select.disabled).toBe(true);
  expect(
    host.querySelector<HTMLInputElement>(".wizard-editor input")!.value,
  ).toBe("/thank-you");
  expect(
    host.querySelector<HTMLInputElement>(".wizard-editor input")!.disabled,
  ).toBe(true);
  expect(
    host.querySelector<HTMLTextAreaElement>(".wizard-editor textarea")!.value,
  ).toBe("Configured error");
  expect(
    host.querySelector<HTMLTextAreaElement>(".wizard-editor textarea")!
      .disabled,
  ).toBe(true);
  expect(
    host.querySelector<HTMLButtonElement>('[role="switch"]')!.disabled,
  ).toBe(true);
  expect(
    host
      .querySelector<HTMLButtonElement>('[role="switch"]')!
      .getAttribute("aria-checked"),
  ).toBe("true");
});
const continueStep = () => click("Continue →");
async function insertField(label: string, type: string) {
  const trigger = host.querySelector<HTMLButtonElement>(
    `[aria-label="${label}"]`,
  )!;
  await act(async () => trigger.click());
  const choice = Array.from(
    document.querySelectorAll<HTMLButtonElement>(".wizard-field-menu button"),
  ).find((button) => button.textContent === type)!;
  expect(choice).toBeDefined();
  await act(async () => choice.click());
}
beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.useFakeTimers();
  vi.clearAllMocks();
  sessionStorage.clear();
  fixture.sitesEnabled = false;
  fixture.siteCount = 2;
  fixture.loadError = false;
  fixture.options = {
    fieldLimit: 20,
    canNotify: true,
    canCreateNotificationTemplates: false,
    notificationTemplateMode: "all",
    notificationTemplateScope: "form",
    editableSettings: [
      "formattingTemplate",
      "storeData",
      "successBehavior",
      "successMessage",
      "errorMessage",
      "returnUrl",
    ],
    defaults: {
      formattingTemplate: "basic-light.twig",
      storeData: false,
      successBehavior: "reload",
      successMessage: "Thanks!",
      errorMessage: "Please check your entries.",
      returnUrl: "",
    },
    formattingTemplates: [{ value: "basic-light.twig", label: "Basic Light" }],
    formattingTemplateGroups: [
      {
        label: "Solspace",
        children: [{ value: "basic-light.twig", label: "Basic Light" }],
      },
    ],
    notificationTemplates: [{ value: "team.twig", label: "Team" }],
    fieldTypes: [
      { value: "text", label: "Text" },
      { value: "email", label: "Email" },
      { value: "radios", label: "Radios" },
    ],
    presets: [
      {
        id: "contact",
        label: "Contact",
        description: "A contact form",
        formDescription: "General website inquiries for team follow-up.",
        fields: [
          {
            key: "firstName",
            label: "First name",
            type: "text",
            required: true,
            width: "half",
            options: [],
            instructions: "",
          },
          {
            key: "email",
            label: "Email",
            type: "email",
            required: true,
            width: "half",
            options: [],
            instructions: "",
          },
        ],
      },
      {
        id: "feedback",
        label: "Feedback",
        description: "A feedback form",
        formDescription:
          "Customer feedback for internal review and service improvements.",
        fields: [
          {
            key: "rating",
            label: "Rating",
            type: "radios",
            required: true,
            width: "full",
            options: ["1", "2", "3", "4", "5"],
            instructions: "",
            adapted: true,
          },
        ],
      },
    ],
  };
  vi.mocked(axios.post).mockImplementation(async (url) => ({
    data: url.endsWith("preview")
      ? { html: "<p>Safe preview</p>" }
      : { id: 42, handle: "contact" },
  }));
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root.render(<FormWizardModal closeModal={fixture.close} />));
});
afterEach(() => {
  Element.prototype.scrollIntoView = originalScrollIntoView;
  act(() => root.unmount());
  host.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it("inserts chosen field types at an exact row or column position and focuses the new name", async () => {
  click("ContactA contact form");
  continueStep();
  continueStep();
  await insertField("Insert field before Email", "Radios");
  const saved = () => fixture.draft! as WizardDraft;
  expect(saved().fields.map((field) => field.type)).toEqual([
    "text",
    "radios",
    "email",
  ]);
  expect(fieldRows(saved().fields).map((row) => row.length)).toEqual([3]);
  expect(saved().fields[1]).toMatchObject({
    required: false,
    options: ["Option 1", "Option 2"],
  });
  expect((document.activeElement as HTMLInputElement).value).toBe("Radios");
  await insertField("Insert field before row 1", "Email");
  expect(fieldRows(saved().fields).map((row) => row.length)).toEqual([1, 3]);
  expect(saved().fields[0].type).toBe("email");
  await insertField("Insert field after row 2", "Text");
  expect(fieldRows(saved().fields).map((row) => row.length)).toEqual([1, 3, 1]);
  expect(saved().fields.at(-1)?.type).toBe("text");
});

it("keeps full rows closed to inline insertion and respects the field limit", async () => {
  click("ContactA contact form");
  continueStep();
  continueStep();
  await insertField("Insert field before Email", "Radios");
  await insertField("Insert field after Email", "Text");
  expect(host.querySelectorAll(".wizard-field-item")).toHaveLength(4);
  expect(host.querySelector(".wizard-row-inserts")).toBeNull();
  expect(host.querySelector(".wizard-insert-row button")).not.toBeNull();
  fixture.options!.fieldLimit = 4;
  act(() => root.render(<FormWizardModal closeModal={fixture.close} />));
  expect(host.querySelector(".wizard-insert-field")).toBeNull();
  expect(button("Add field")).toBeUndefined();
});

it("dismisses the insertion picker with Escape without closing the wizard or changing fields", async () => {
  click("ContactA contact form");
  continueStep();
  continueStep();
  const trigger = host.querySelector<HTMLButtonElement>(
    '[aria-label="Insert field before Email"]',
  )!;
  await act(async () => trigger.click());
  const menu = document.querySelector<HTMLElement>(".wizard-field-menu")!;
  expect(menu).not.toBeNull();
  await act(async () =>
    menu.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    ),
  );
  expect(document.querySelector(".wizard-field-menu")).toBeNull();
  expect(host.querySelectorAll(".wizard-field-item")).toHaveLength(2);
  expect(fixture.close).not.toHaveBeenCalled();
  expect(document.activeElement).toBe(trigger);
});

it("saves once and keeps the transition covered until the saved builder has hydrated", async () => {
  continueStep();
  expect(host.querySelector('[role="alert"]')?.textContent).toBe(
    "Choose a purpose for your form.",
  );
  click("ContactA contact form");
  continueStep();
  type(".wizard-editor input", "Wizard contact");
  continueStep();
  expect(host.querySelectorAll(".wizard-field-item")).toHaveLength(2);
  continueStep();
  continueStep();
  continueStep();
  continueStep();
  expect(axios.post).not.toHaveBeenCalled();
  await act(async () => button("Create form").click());
  expect(axios.post).toHaveBeenCalledOnce();
  expect(vi.mocked(axios.post).mock.calls[0][1]).toMatchObject({
    name: "Wizard contact",
    storeData: false,
    formattingTemplate: "basic-light.twig",
    adminEnabled: false,
    confirmationEnabled: false,
  });
  expect(fixture.navigate).toHaveBeenCalledExactlyOnceWith("/forms/42");
  expect(fixture.invalidate).toHaveBeenCalledWith({
    queryKey: ["forms", "default"],
  });
  expect(host.textContent).toContain("Your form is ready!");
  expect(fixture.close).not.toHaveBeenCalled();
  const builder = document.createElement("div");
  builder.id = "freeform-client-app";
  builder.innerHTML = '<div data-form-builder-id="99"></div>';
  await act(async () => document.body.append(builder));
  await act(async () => vi.advanceTimersByTime(750));
  expect(fixture.close).not.toHaveBeenCalled();
  await act(async () =>
    builder.firstElementChild!.setAttribute("data-form-builder-id", "42"),
  );
  await act(async () => vi.advanceTimersByTime(50));
  expect(host.querySelector('[data-handoff="revealing"]')).not.toBeNull();
  expect(fixture.close).not.toHaveBeenCalled();
  await act(async () => vi.advanceTimersByTime(650));
  expect(fixture.close).toHaveBeenCalledOnce();
  builder.remove();
});

it("asks before replacing customized fields and preserves the form name", () => {
  click("ContactA contact form");
  continueStep();
  type(".wizard-editor input", "My custom form");
  click("← Back");
  click("FeedbackA feedback form");
  expect(host.textContent).toContain("Changing the purpose replaces");
  click("Keep current fields");
  expect(host.querySelectorAll(".wizard-preview-field")).toHaveLength(2);
  click("FeedbackA feedback form");
  click("Replace fields");
  continueStep();
  expect(
    (host.querySelector(".wizard-editor input") as HTMLInputElement).value,
  ).toBe("My custom form");
  expect(host.querySelectorAll(".wizard-preview-options input")).toHaveLength(
    5,
  );
});

it("uses the configured default template and disables its picker when it is locked", async () => {
  fixture.options!.defaults.formattingTemplate = "branded.twig";
  fixture.options!.formattingTemplateGroups = [
    { value: "branded.twig", label: "Branded" },
  ];
  fixture.options!.editableSettings = fixture.options!.editableSettings.filter(
    (key) => key !== "formattingTemplate",
  );
  act(() => root.unmount());
  root = createRoot(host);
  act(() => root.render(<FormWizardModal closeModal={fixture.close} />));
  click("ContactA contact form");
  continueStep();
  continueStep();
  continueStep();
  const picker = host.querySelector<HTMLElement>(
    '[aria-label="Formatting Template"]',
  )!;
  expect(picker.getAttribute("aria-disabled")).toBe("true");
  expect(picker.textContent).toContain("Branded");
  act(() =>
    picker.dispatchEvent(
      new KeyboardEvent("keyup", { key: "Enter", bubbles: true }),
    ),
  );
  expect(document.querySelector(".dropdown-rollout")).toBeNull();
  await act(async () => vi.advanceTimersByTime(500));
  expect(axios.post).toHaveBeenCalledWith(
    "/api/forms/wizard/preview",
    expect.objectContaining({ formattingTemplate: "branded.twig" }),
    expect.anything(),
  );
});

it("debounces template preview requests and uses an isolated iframe", async () => {
  click("ContactA contact form");
  continueStep();
  continueStep();
  continueStep();
  expect(axios.post).not.toHaveBeenCalled();
  await act(async () => vi.advanceTimersByTime(500));
  expect(axios.post).toHaveBeenCalledExactlyOnceWith(
    "/api/forms/wizard/preview",
    expect.objectContaining({ purpose: "contact" }),
    expect.objectContaining({ signal: expect.any(AbortSignal) }),
  );
  const frame = host.querySelector("iframe")!;
  expect(frame.getAttribute("sandbox")).toBe("allow-scripts");
  expect(frame.getAttribute("srcdoc")).toBe("<p>Safe preview</p>");
});

it("requires valid notification recipients before the review step", () => {
  click("ContactA contact form");
  continueStep();
  continueStep();
  continueStep();
  continueStep();
  continueStep();
  const checkbox = host.querySelector<HTMLButtonElement>(
    '.wizard-editor button[role="switch"]',
  )!;
  act(() => checkbox.click());
  continueStep();
  expect(host.querySelector('[role="alert"]')?.textContent).toContain(
    "valid team email",
  );
  expect(button("Skip for now")).toBeUndefined();
  act(() => checkbox.click());
  continueStep();
  expect(
    host.querySelector('[aria-current="step"]')?.getAttribute("aria-label"),
  ).toBe("Preview");
  expect(host.textContent).not.toContain("Ready to create your form?");
  expect(axios.post).not.toHaveBeenCalled();
});

it("pairs adjacent half-width fields without squeezing full-width fields", () => {
  const fields = fixture.options!.presets[0].fields;
  expect(
    fieldRows([
      ...fields,
      { ...fields[0], key: "message", width: "full" },
      ...fields,
    ]).map((row) => row.length),
  ).toEqual([2, 1, 2]);
});

it("requires confirmation before discarding changes and creates a fresh request identity", () => {
  click("ContactA contact form");
  const original = fixture.draft!.requestToken;
  click("Start over");
  click("Keep editing");
  expect(host.querySelectorAll(".wizard-preview-field")).toHaveLength(2);
  click("Start over");
  click("Start over");
  expect(host.querySelectorAll(".wizard-preview-field")).toHaveLength(0);
  const reset = fixture.draft!;
  expect(reset.purpose).toBe("");
  expect(reset.requestToken).not.toBe(original);
  expect(axios.post).not.toHaveBeenCalled();
});

it("retries an uncertain save with the same request token and hides server HTML", async () => {
  click("ContactA contact form");
  for (let step = 0; step < 6; step++) continueStep();
  vi.mocked(axios.post).mockRejectedValueOnce({
    response: {
      status: 502,
      data: { message: "<html>Gateway exception</html>" },
    },
  });
  await act(async () => button("Create form").click());
  expect(host.textContent).toContain("Try again to check the same request");
  expect(host.textContent).not.toContain("Gateway exception");
  await act(async () => button("Create form").click());
  expect(axios.post).toHaveBeenCalledTimes(2);
  expect(
    (vi.mocked(axios.post).mock.calls[0][1] as WizardDraft).requestToken,
  ).toBe((vi.mocked(axios.post).mock.calls[1][1] as WizardDraft).requestToken);
  expect(host.textContent).toContain("Your form is ready!");
});

it("groups thirds and quarters consistently, with separate incomplete and mixed-width rows", () => {
  const field = fixture.options!.presets[0].fields[0];
  const widths = [
    "third",
    "third",
    "third",
    "third",
    "quarter",
    "quarter",
    "quarter",
    "quarter",
    "quarter",
    "half",
    "half",
    "full",
  ] as const;
  expect(
    fieldRows(
      widths.map((width, index) => ({ ...field, key: `field${index}`, width })),
    ).map((row) => row.length),
  ).toEqual([3, 1, 4, 1, 2, 1]);
});

it.each([
  [false, 2, false],
  [true, 1, false],
  [true, 2, true],
] as const)(
  "shows Sites only when site-aware forms are enabled (%s) and more than one site is editable (%s)",
  (enabled, siteCount, visible) => {
    fixture.sitesEnabled = enabled;
    fixture.siteCount = siteCount;
    click("ContactA contact form");
    continueStep();
    expect(host.querySelector(".wizard-sites") !== null).toBe(visible);
  },
);

it("defaults to the current site, requires a site, and creates the form for multiple selected sites", async () => {
  fixture.sitesEnabled = true;
  click("ContactA contact form");
  continueStep();
  const sites = () =>
    Array.from(host.querySelectorAll<HTMLInputElement>(".wizard-sites input"));
  expect(sites().map((site) => site.checked)).toEqual([true, false]);
  act(() => sites()[0].click());
  continueStep();
  expect(host.querySelector('[role="alert"]')?.textContent).toContain(
    "Select at least one site",
  );
  click("Select All");
  expect(button("Deselect All")).toBeDefined();
  click("Deselect All");
  expect(sites().map((site) => site.checked)).toEqual([false, false]);
  expect(button("Select All")).toBeDefined();
  act(() => {
    sites()[0].click();
    sites()[1].click();
  });
  expect(button("Deselect All")).toBeDefined();
  act(() => sites()[1].click());
  expect(button("Select All")).toBeDefined();
  click("Select All");
  expect(sites().map((site) => site.checked)).toEqual([true, true]);
  for (let step = 1; step < 6; step++) continueStep();
  expect(host.querySelector(".wizard-review")).toBeNull();
  await act(async () => button("Create form").click());
  expect(vi.mocked(axios.post).mock.calls.at(-1)?.[1]).toMatchObject({
    siteIds: [1, 2],
  });
  expect(fixture.invalidate).toHaveBeenCalledWith({
    queryKey: ["forms", "fr"],
  });
});

it("previews the edited success message only on the Behavior step", async () => {
  click("ContactA contact form");
  for (let step = 0; step < 4; step++) continueStep();
  await act(async () => vi.advanceTimersByTime(500));
  expect(vi.mocked(axios.post).mock.calls.at(-1)?.[1]).toMatchObject({
    previewSuccess: true,
    successMessage: "Thanks!",
  });
  const message = host.querySelector<HTMLTextAreaElement>(
    ".wizard-editor textarea",
  )!;
  act(() => {
    Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      "value",
    )!.set!.call(message, "We received your message.");
    message.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await act(async () => vi.advanceTimersByTime(500));
  expect(vi.mocked(axios.post).mock.calls.at(-1)?.[1]).toMatchObject({
    previewSuccess: true,
    successMessage: "We received your message.",
  });
  click("Layout");
  expect(host.querySelector(".wizard-preview-success")?.textContent).toContain(
    "We received your message.",
  );
  continueStep();
  expect(host.querySelector(".wizard-preview-success")).toBeNull();
  click("Template");
  await act(async () => vi.advanceTimersByTime(500));
  expect(vi.mocked(axios.post).mock.calls.at(-1)?.[1]).toMatchObject({
    previewSuccess: false,
  });
});

it("opens a form in its selected site when the current site was deselected", async () => {
  fixture.sitesEnabled = true;
  click("ContactA contact form");
  continueStep();
  const sites = Array.from(
    host.querySelectorAll<HTMLInputElement>(".wizard-sites input"),
  );
  act(() => {
    sites[0].click();
    sites[1].click();
  });
  for (let step = 1; step < 6; step++) continueStep();
  await act(async () => button("Create form").click());
  expect(fixture.change).toHaveBeenCalledWith("fr");
  expect(fixture.navigate).toHaveBeenLastCalledWith("/forms/42?site=fr");
});

it("keeps a saved form recoverable if the real builder does not load", async () => {
  click("ContactA contact form");
  for (let step = 0; step < 6; step++) continueStep();
  await act(async () => button("Create form").click());
  await act(async () => vi.advanceTimersByTime(15000));
  expect(fixture.close).not.toHaveBeenCalled();
  expect(host.textContent).toContain(
    "Your form was saved, but the builder is taking longer to open.",
  );
  expect(button("Create form")).toBeUndefined();
  click("Show me around");
  expect(fixture.navigate).toHaveBeenLastCalledWith("/forms/42?wizardTour=1");
  expect(fixture.close).toHaveBeenCalledOnce();
});

it("does not close another modal if the wizard was dismissed during its handoff", async () => {
  click("ContactA contact form");
  for (let step = 0; step < 6; step++) continueStep();
  await act(async () => button("Create form").click());
  click("Close");
  const builder = document.createElement("div");
  builder.id = "freeform-client-app";
  builder.innerHTML = '<div data-form-builder-id="42"></div>';
  await act(async () => document.body.append(builder));
  await act(async () => vi.advanceTimersByTime(2000));
  expect(fixture.close).toHaveBeenCalledOnce();
  builder.remove();
});

it("reveals a hydrated builder immediately for reduced motion and cancels a handoff on unmount", async () => {
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  click("ContactA contact form");
  for (let step = 0; step < 6; step++) continueStep();
  await act(async () => button("Create form").click());
  const builder = document.createElement("div");
  builder.id = "freeform-client-app";
  builder.innerHTML = '<div data-form-builder-id="42"></div>';
  await act(async () => document.body.append(builder));
  await act(async () => vi.advanceTimersByTime(50));
  expect(fixture.close).toHaveBeenCalledOnce();
  act(() => root.unmount());
  root = createRoot(host);
  await act(async () => vi.advanceTimersByTime(20000));
  expect(fixture.close).toHaveBeenCalledOnce();
  builder.remove();
});

it("reorders fields by drag handle without losing settings, preview order, or field state", async () => {
  click("ContactA contact form");
  continueStep();
  continueStep();
  act(() =>
    host.querySelector<HTMLButtonElement>(".wizard-field-title")!.click(),
  );
  type(".wizard-field-label-input", "Your name");
  const list = host.querySelector<HTMLOListElement>(".wizard-row-fields")!;
  const sortable = Sortable.get(list)!;
  const first = list.children[0] as HTMLElement;
  const event = {
    item: first,
    from: list,
    to: list,
    oldDraggableIndex: 0,
    newDraggableIndex: 1,
  } as unknown as SortableEvent;
  act(() => {
    sortable.options.onStart?.(event);
    list.append(first);
    sortable.options.onEnd?.(event);
  });
  expect(
    Array.from(list.children).map((item) =>
      item.getAttribute("data-field-key"),
    ),
  ).toEqual(["email", "firstName"]);
  const draft = fixture.draft!;
  expect(draft.fields.map((field: { key: string }) => field.key)).toEqual([
    "email",
    "firstName",
  ]);
  expect(draft.fields[1].label).toBe("Your name");
  expect(
    Array.from(host.querySelectorAll(".wizard-preview-field > label")).map(
      (label) => label.textContent,
    ),
  ).toEqual(["Email *", "Your name *"]);
  const handle = list.querySelector<HTMLButtonElement>(".wizard-field-handle")!;
  act(() =>
    handle.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    ),
  );
  expect(list.children[0].getAttribute("data-field-key")).toBe("firstName");
  expect(
    host.querySelector('[role="status"][aria-live="polite"]')?.textContent,
  ).toContain("Email moved to position 2 of 2");
  await insertField("Insert field after row 1", "Text");
  expect(host.querySelectorAll(".wizard-field-item")).toHaveLength(3);
  act(() =>
    host
      .querySelector<HTMLButtonElement>(
        '[data-field-key="firstName"] .wizard-field-remove',
      )!
      .click(),
  );
  expect(
    Array.from(list.children).map((item) =>
      item.getAttribute("data-field-key"),
    )[0],
  ).toBe("email");
});

it("shows both messages on Behavior and previews the focused field", async () => {
  click("ContactA contact form");
  for (let step = 0; step < 4; step++) continueStep();
  expect(
    host.querySelector('[aria-current="step"]')?.getAttribute("aria-label"),
  ).toBe("Behavior");
  expect(host.querySelector(".wizard-message-tabs")).toBeNull();
  const [success, error] = Array.from(
    host.querySelectorAll<HTMLTextAreaElement>(".wizard-editor textarea"),
  );
  expect([success.rows, error.rows]).toEqual([2, 2]);
  expect(success.value).toBe("Thanks!");
  expect(error.value).toBe("Please check your entries.");
  act(() => error.focus());
  await act(async () => vi.advanceTimersByTime(500));
  expect(vi.mocked(axios.post).mock.calls.at(-1)?.[1]).toMatchObject({
    previewError: true,
    previewSuccess: false,
    errorMessage: "Please check your entries.",
  });
  click("Layout");
  expect(host.querySelector(".wizard-preview-error")?.textContent).toBe(
    "Please check your entries.",
  );
  expect(host.querySelector(".wizard-preview-success")).toBeNull();
  act(() => success.focus());
  expect(host.querySelector(".wizard-preview-success")?.textContent).toContain(
    "Thanks!",
  );
  expect(host.querySelector(".wizard-preview-error")).toBeNull();
  const select = host.querySelector<HTMLSelectElement>(
    ".wizard-editor select",
  )!;
  act(() => {
    select.value = "redirect-return-url";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  expect(
    host.querySelector<HTMLInputElement>('[placeholder="/thank-you"]'),
  ).not.toBeNull();
  expect(host.querySelectorAll(".wizard-editor textarea")).toHaveLength(1);
  expect(
    host.querySelector<HTMLTextAreaElement>(".wizard-editor textarea")?.value,
  ).toBe("Please check your entries.");
});

it("keeps visitor confirmations attached to an added Email field after reordering", async () => {
  click("ContactA contact form");
  continueStep();
  continueStep();
  const select = (element: HTMLSelectElement, value: string) =>
    act(() => {
      element.value = value;
      element.dispatchEvent(new Event("change", { bubbles: true }));
    });
  await insertField("Insert field after row 1", "Email");
  continueStep();
  continueStep();
  continueStep();
  act(() =>
    host
      .querySelector<HTMLButtonElement>(
        '[aria-label="Send the visitor a confirmation"]',
      )!
      .click(),
  );
  select(
    host.querySelectorAll<HTMLSelectElement>(".wizard-editor select")[0],
    "customField2",
  );
  select(
    host.querySelectorAll<HTMLSelectElement>(".wizard-editor select")[1],
    "team.twig",
  );
  act(() =>
    host
      .querySelector<HTMLButtonElement>('button[aria-label="Fields"]')!
      .click(),
  );
  const handle = host.querySelectorAll<HTMLButtonElement>(
    ".wizard-field-handle",
  )[2];
  act(() =>
    handle.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Home", bubbles: true }),
    ),
  );
  const draft = fixture.draft!;
  expect(draft.confirmationField).toBe("customField0");
  expect(draft.confirmationEnabled).toBe(true);
  expect(draft.confirmationTemplate).toBe("team.twig");
});

it("moves fields beside others or into new rows while enforcing four per row", () => {
  const base = fixture.options!.presets[0].fields[0];
  const fields = normalizeRows(
    Array.from({ length: 6 }, (_, index) => ({
      ...base,
      key: `field${index}`,
      rowId: index < 2 ? "a" : index < 4 ? "b" : "c",
    })),
  );
  const joined = placeField(fields, "field2", "a");
  expect(fieldRows(joined).map((row) => row.map((field) => field.key))).toEqual(
    [["field0", "field1", "field2"], ["field3"], ["field4", "field5"]],
  );
  const full = placeField(joined, "field3", "a", "field1");
  expect(placeField(full, "field4", "a")).toBe(full);
  const split = placeField(full, "field2", undefined, undefined, "c");
  expect(fieldRows(split).map((row) => row.length)).toEqual([3, 1, 2]);
  expect(new Set(fieldRows(split).map((row) => row[0].rowId)).size).toBe(3);
  const ownRow = placeField(
    split,
    "field2",
    undefined,
    undefined,
    split.find((field) => field.key === "field2")!.rowId,
  );
  expect(ownRow.map((field) => field.key)).toEqual(
    split.map((field) => field.key),
  );
});

it("defaults to creating notification templates and forces that choice when none exist", () => {
  act(() => root.unmount());
  fixture.options!.canCreateNotificationTemplates = true;
  fixture.options!.notificationTemplates = [];
  root = createRoot(host);
  act(() => root.render(<FormWizardModal closeModal={fixture.close} />));
  click("ContactA contact form");
  for (let step = 0; step < 5; step++) continueStep();
  act(() =>
    host
      .querySelector<HTMLButtonElement>(
        '[role="switch"][aria-label="Notify my team"]',
      )!
      .click(),
  );
  const toggle = host.querySelector<HTMLButtonElement>(
    '.wizard-email-template [role="switch"]',
  )!;
  expect(toggle.getAttribute("aria-checked")).toBe("true");
  expect(toggle.disabled).toBe(true);
  expect(host.textContent).toContain("form-specific");
  expect(host.querySelector(".wizard-email-template select")).toBeNull();
});

it("uses a full-width final preview and confirms before restarting or cancelling", () => {
  click("ContactA contact form");
  for (let step = 0; step < 6; step++) continueStep();
  expect(host.querySelector('[data-review="true"]')).not.toBeNull();
  expect(host.querySelector(".wizard-review-summary")).toBeNull();
  click("Start over");
  expect(host.textContent).toContain("Start over? Your changes will be lost.");
  click("Keep editing");
  expect(
    host.querySelector('[aria-current="step"]')?.getAttribute("aria-label"),
  ).toBe("Preview");
  expect(host.textContent).not.toContain("Ready to create your form?");
  click("Start over");
  click("Start over");
  expect(
    host.querySelector('[aria-current="step"]')?.getAttribute("aria-label"),
  ).toBe("Purpose");
  expect(fixture.draft!.fields).toEqual([]);
  click("Cancel");
  expect(host.textContent).toContain("Leave setup? Your changes will be lost.");
  click("Leave setup");
  expect(fixture.close).toHaveBeenCalledOnce();
  expect(sessionStorage.getItem("freeform.wizard.v1.test-user.1")).toBeNull();
});

it("changes preview size without sending another preview request", async () => {
  click("ContactA contact form");
  continueStep();
  continueStep();
  continueStep();
  await act(async () => vi.advanceTimersByTime(500));
  const count = vi.mocked(axios.post).mock.calls.length;
  const select = host.querySelector<HTMLSelectElement>(
    ".wizard-preview-size select",
  )!;
  act(() => {
    select.value = "phone";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await act(async () => vi.advanceTimersByTime(500));
  expect(
    host.querySelector<HTMLElement>(".wizard-preview-canvas")!.style.width,
  ).toBe("390px");
  expect(vi.mocked(axios.post).mock.calls).toHaveLength(count);
});

it("removes an emptied source row after Sortable removes its fallback clone", async () => {
  click("ContactA contact form");
  continueStep();
  continueStep();
  await insertField("Insert field after row 1", "Text");
  const rows = host.querySelectorAll<HTMLOListElement>(".wizard-row-fields");
  const source = rows[1],
    target = rows[0];
  const item = source.querySelector<HTMLElement>(".wizard-field-item")!;
  const clone = item.cloneNode(true);
  source.append(clone);
  const sortable = Sortable.get(source)!;
  const event = {
    item,
    from: source,
    to: target,
    oldDraggableIndex: 0,
    newDraggableIndex: 2,
  } as unknown as SortableEvent;
  act(() => {
    sortable.options.onStart?.(event);
    target.append(item);
    clone.parentNode!.removeChild(clone);
    sortable.options.onEnd?.(event);
  });
  expect(host.querySelectorAll(".wizard-row-fields")).toHaveLength(1);
  expect(
    host.querySelectorAll(".wizard-row-fields .wizard-field-item"),
  ).toHaveLength(3);
  const saved = fixture.draft!;
  expect(new Set(saved.fields.map((field) => field.rowId)).size).toBe(1);
});

it("moves a whole three-field row by its handle and keyboard, preserving settings and the open editor", () => {
  const [first, email] = fixture.options!.presets[0].fields;
  fixture.options!.presets[0].fields = [
    { ...first, rowId: "a" },
    { ...email, rowId: "a" },
    { ...first, key: "extraThird", label: "Third", rowId: "a" },
    { ...first, key: "extraFourth", label: "Fourth", rowId: "b" },
    { ...first, key: "extraFifth", label: "Fifth", rowId: "c" },
  ];
  click("ContactA contact form");
  continueStep();
  continueStep();
  act(() =>
    host.querySelector<HTMLButtonElement>(".wizard-field-title")!.click(),
  );
  type(".wizard-field-label-input", "Your name");
  const list = host.querySelector<HTMLElement>(".wizard-field-list")!;
  expect(list.querySelectorAll(".wizard-row-handle")).toHaveLength(1);
  expect(
    list.querySelector('[data-layout-row-id="b"] .wizard-row-handle'),
  ).toBeNull();
  expect(
    list.querySelector('[data-layout-row-id="b"] .wizard-field-handle'),
  ).not.toBeNull();
  const item = list.querySelector<HTMLElement>(".wizard-field-row")!;
  const sortable = Sortable.get(list)!;
  const event = {
    item,
    from: list,
    to: list,
    oldDraggableIndex: 0,
    newDraggableIndex: 2,
  } as unknown as SortableEvent;
  act(() => {
    sortable.options.onStart?.(event);
    list.append(item);
    sortable.options.onEnd?.(event);
  });
  const saved = () => fixture.draft!;
  expect(saved().fields.map((field: { key: string }) => field.key)).toEqual([
    "extraFourth",
    "extraFifth",
    "firstName",
    "email",
    "extraThird",
  ]);
  expect(fieldRows(saved().fields).map((row) => row.length)).toEqual([1, 1, 3]);
  expect(
    host.querySelector<HTMLInputElement>(
      '[data-field-key="firstName"] .wizard-field-label-input',
    )?.value,
  ).toBe("Your name");
  expect(
    host.querySelector('[role="status"][aria-live="polite"]')!.textContent,
  ).toContain("Row moved to position 3 of 3.");
  expect(
    Array.from(host.querySelectorAll(".wizard-preview-row")).map(
      (row) => row.children.length,
    ),
  ).toEqual([1, 1, 3]);
  const handle = host.querySelector<HTMLButtonElement>(
    '[data-layout-row-id="a"] > .wizard-row-handle',
  )!;
  act(() =>
    handle.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Home", bubbles: true }),
    ),
  );
  expect(saved().fields.map((field: { key: string }) => field.key)).toEqual([
    "firstName",
    "email",
    "extraThird",
    "extraFourth",
    "extraFifth",
  ]);
  expect(fieldRows(saved().fields).map((row) => row.length)).toEqual([3, 1, 1]);
  expect(saved().fields[0].label).toBe("Your name");
});

it("shows only the current field destination and can split a field into a new row", () => {
  click("ContactA contact form");
  continueStep();
  continueStep();
  const source = host.querySelector<HTMLOListElement>(".wizard-row-fields")!;
  const gaps = host.querySelectorAll<HTMLOListElement>(".wizard-new-row");
  const target = gaps[gaps.length - 1];
  const item = source.querySelector<HTMLElement>(".wizard-field-item")!;
  const sortable = Sortable.get(source)!;
  const event = {
    item,
    from: source,
    to: target,
    oldDraggableIndex: 0,
    newDraggableIndex: 0,
  } as unknown as SortableEvent;
  act(() => {
    sortable.options.onStart?.(event);
    sortable.options.onMove?.(
      { to: gaps[0] } as unknown as MoveEvent,
      new Event("mousemove"),
    );
  });
  expect(host.querySelectorAll('[data-drop-active="true"]')).toHaveLength(1);
  expect(gaps[0].dataset.dropActive).toBe("true");
  expect(host.querySelectorAll(".wizard-drop-label")).toHaveLength(0);
  act(() =>
    sortable.options.onMove?.(
      { to: target } as unknown as MoveEvent,
      new Event("mousemove"),
    ),
  );
  expect(gaps[0].dataset.dropActive).toBeUndefined();
  expect(target.dataset.dropActive).toBe("true");
  expect(host.querySelectorAll('[data-drop-active="true"]')).toHaveLength(1);
  act(() => {
    target.append(item);
    sortable.options.onEnd?.(event);
  });
  expect(host.querySelectorAll('[data-drop-active="true"]')).toHaveLength(0);
  const saved = fixture.draft!;
  expect(
    fieldRows(saved.fields).map((row) => row.map((field) => field.key)),
  ).toEqual([["email"], ["firstName"]]);
  expect(saved.fields[1].label).toBe("First name");
});

it("edits names, types, required status, and removal directly on compact field cards", () => {
  click("ContactA contact form");
  continueStep();
  continueStep();
  const first = () =>
    host.querySelector<HTMLElement>('[data-field-key="firstName"]')!;
  expect(first().querySelector(".wizard-field-kind")).toBeNull();
  act(() =>
    first().querySelector<HTMLButtonElement>(".wizard-field-title")!.click(),
  );
  type(".wizard-field-label-input", "Full name");
  act(() =>
    first()
      .querySelector<HTMLInputElement>(".wizard-field-label-input")!
      .dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      ),
  );
  expect(first().querySelector(".wizard-field-label-input")).toBeNull();
  const select = first().querySelector<HTMLSelectElement>("select")!;
  act(() => {
    select.value = "radios";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  act(() =>
    first().querySelector<HTMLButtonElement>(".wizard-field-required")!.click(),
  );
  const saved = fixture.draft!;
  expect(saved.fields[0]).toMatchObject({
    label: "Full name",
    type: "radios",
    required: false,
    options: ["Option 1", "Option 2"],
  });
  expect(
    first().querySelector('[aria-label="Edit choices for Full name"]'),
  ).not.toBeNull();
  expect(host.querySelector(".wizard-row-editor")).toBeNull();
  act(() =>
    first().querySelector<HTMLButtonElement>(".wizard-field-remove")!.click(),
  );
  expect(host.querySelector('[data-field-key="firstName"]')).toBeNull();
  expect(host.querySelector('[data-field-key="email"]')).not.toBeNull();
});

it("starts fresh on reopen, ignores old saved drafts, and never offers or writes drafts", () => {
  const key = "freeform.wizard.v1.test-user.1";
  sessionStorage.setItem(
    key,
    JSON.stringify({
      ...fixture.draft!,
      purpose: "contact",
      name: "Old draft",
      fields: fixture.options!.presets[0].fields,
      wizardStep: 5,
      wizardFurthest: 6,
    }),
  );
  const write = vi.spyOn(Storage.prototype, "setItem");
  click("ContactA contact form");
  const originalToken = fixture.draft!.requestToken;
  for (let step = 0; step < 7; step++) {
    expect(button("Save draft & close")).toBeUndefined();
    if (step < 6) continueStep();
  }
  act(() =>
    host.querySelector<HTMLButtonElement>('[aria-label="Close"]')!.click(),
  );
  expect(fixture.close).not.toHaveBeenCalled();
  click("Leave setup");
  expect(fixture.close).toHaveBeenCalledOnce();
  act(() => root.unmount());
  root = createRoot(host);
  act(() => root.render(<FormWizardModal closeModal={fixture.close} />));
  expect(
    host.querySelector('[aria-current="step"]')?.getAttribute("aria-label"),
  ).toBe("Purpose");
  expect(fixture.draft!).toMatchObject({
    purpose: "",
    name: "",
    fields: [],
    siteIds: [1],
  });
  expect(fixture.draft!.requestToken).not.toBe(originalToken);
  expect(
    host.querySelector<HTMLButtonElement>('[aria-label="Preview"]')!.disabled,
  ).toBe(true);
  expect(write).not.toHaveBeenCalled();
  write.mockRestore();
});

it("places Back immediately before Continue with a left arrow", () => {
  click("ContactA contact form");
  continueStep();
  const back = button("← Back");
  expect(back.nextElementSibling).toBe(button("Continue →"));
  click("← Back");
  expect(
    host.querySelector('[aria-current="step"]')?.getAttribute("aria-label"),
  ).toBe("Purpose");
});

it("uses only inline insertion and keeps an empty layout ready for a first field", async () => {
  click("ContactA contact form");
  continueStep();
  continueStep();
  expect(host.querySelector(".wizard-add")).toBeNull();
  expect(host.querySelector('[aria-label="New field type"]')).toBeNull();
  expect(host.textContent).not.toContain(
    "The wizard includes common field types.",
  );
  expect(host.textContent).not.toContain(
    "Fields in the same row share the space evenly.",
  );
  for (const key of ["firstName", "email"]) {
    act(() =>
      host
        .querySelector<HTMLButtonElement>(
          `[data-field-key="${key}"] .wizard-field-remove`,
        )!
        .click(),
    );
  }
  expect(
    host.querySelector('.wizard-field-list[data-empty="true"]'),
  ).not.toBeNull();
  await insertField("Add field", "Email");
  expect(host.querySelectorAll(".wizard-field-item")).toHaveLength(1);
  expect(fixture.draft!.fields[0].type).toBe("email");
});

it("keeps initial loading compact, allows cancellation, and recovers from setup errors", () => {
  const options = fixture.options;
  fixture.options = null;
  act(() => root.render(<FormWizardModal closeModal={fixture.close} />));
  expect(host.querySelector(".wizard-loading-track")).not.toBeNull();
  expect(host.querySelector(".wizard-editor")).toBeNull();
  expect(host.querySelector('[role="status"]')?.textContent).toContain(
    "Preparing guided setup",
  );
  click("Close");
  expect(fixture.close).toHaveBeenCalledOnce();
  fixture.loadError = true;
  act(() => root.render(<FormWizardModal closeModal={fixture.close} />));
  expect(host.querySelector('[role="status"]')?.textContent).toBe(
    "Could not load form setup.",
  );
  click("Try again");
  expect(fixture.refetch).toHaveBeenCalledOnce();
  fixture.loadError = false;
  fixture.options = options;
  act(() => root.render(<FormWizardModal closeModal={fixture.close} />));
  expect(host.querySelector(".wizard-loading-track")).toBeNull();
  expect(host.textContent).toContain("What will your form be used for?");
});

it("marks every invalid email control and clears only corrected fields", () => {
  click("ContactA contact form");
  for (let step = 0; step < 5; step++) continueStep();
  for (const title of ["Notify my team", "Send the visitor a confirmation"]) {
    act(() =>
      host.querySelector<HTMLButtonElement>(`[aria-label="${title}"]`)!.click(),
    );
  }
  continueStep();
  expect(
    host.querySelectorAll('.wizard-editor [aria-invalid="true"]'),
  ).toHaveLength(4);
  const email = host.querySelector<HTMLInputElement>('input[type="email"]')!;
  expect(email.getAttribute("aria-errormessage")).toBe(
    host.querySelector('[role="alert"]')!.id,
  );
  type('input[type="email"]', "team@example.test");
  expect(email.hasAttribute("aria-invalid")).toBe(false);
  expect(
    host.querySelectorAll('.wizard-editor [aria-invalid="true"]'),
  ).toHaveLength(3);
  expect(host.querySelector('[role="alert"]')?.textContent).toContain(
    "template for the team",
  );
  const select = host.querySelector<HTMLSelectElement>(
    ".wizard-email-template select",
  )!;
  act(() => {
    select.value = "team.twig";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  expect(select.hasAttribute("aria-invalid")).toBe(false);
  expect(
    host.querySelectorAll('.wizard-editor [aria-invalid="true"]'),
  ).toHaveLength(2);
  expect(host.querySelector('[role="alert"]')?.textContent).toContain(
    "visitor confirmation",
  );
});

it("associates toggle instructions with the switch below its title", () => {
  fixture.options!.canCreateNotificationTemplates = true;
  click("ContactA contact form");
  for (let step = 0; step < 5; step++) continueStep();
  act(() =>
    host
      .querySelector<HTMLButtonElement>('[aria-label="Notify my team"]')!
      .click(),
  );
  const toggle = host.querySelector<HTMLButtonElement>(
    '[aria-label="Create a new template"]',
  )!;
  act(() => toggle.click());
  const id = toggle.getAttribute("aria-describedby")!;
  const instructions = document.getElementById(id)!;
  expect(instructions.textContent).toContain("form-specific template");
  expect(instructions.parentElement?.className).toBe("wizard-toggle-text");
  expect(instructions.previousElementSibling?.textContent).toBe(
    "Create a new template",
  );
});

it("shows only the template preview on the final Preview step", async () => {
  click("ContactA contact form");
  for (let step = 0; step < 6; step++) continueStep();
  expect(
    host.querySelector('[aria-current="step"]')?.getAttribute("aria-label"),
  ).toBe("Preview");
  expect(host.querySelector(".wizard-preview-tabs")).toBeNull();
  expect(host.querySelector(".wizard-preview-size select")).not.toBeNull();
  await act(async () => vi.advanceTimersByTime(500));
  expect(host.querySelector("iframe")?.getAttribute("srcdoc")).toBe(
    "<p>Safe preview</p>",
  );
});

it("confirms before closing with the heading X or Escape and preserves progress when kept", () => {
  click("ContactA contact form");
  continueStep();
  const token = fixture.draft!.requestToken;
  const close = host.querySelector<HTMLButtonElement>('[aria-label="Close"]')!;
  act(() => close.click());
  expect(fixture.close).not.toHaveBeenCalled();
  expect(host.textContent).toContain("Leave setup? Your changes will be lost.");
  click("Keep editing");
  expect(fixture.draft!.purpose).toBe("contact");
  expect(fixture.draft!.requestToken).toBe(token);
  expect(
    host.querySelector('[aria-current="step"]')?.getAttribute("aria-label"),
  ).toBe("Details");
  act(() =>
    host
      .querySelector('[role="dialog"]')!
      .dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      ),
  );
  expect(fixture.close).not.toHaveBeenCalled();
  expect(host.textContent).toContain("Leave setup? Your changes will be lost.");
  click("Leave setup");
  expect(fixture.close).toHaveBeenCalledOnce();
});
