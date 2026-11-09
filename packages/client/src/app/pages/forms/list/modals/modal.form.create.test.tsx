import axios from "axios";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CreateFormModal } from "./modal.form.create";

const fixture = vi.hoisted(() => ({
  close: vi.fn(),
  navigate: vi.fn(),
  currentSite: { id: 2 },
  optionsError: false,
  fields: [
    {
      key: "email",
      type: "email",
      label: "Email",
      required: true,
      width: "full",
      options: [] as string[],
      instructions: "",
    },
  ],
}));
vi.mock("axios", () => ({ default: { post: vi.fn() } }));
vi.mock("@config/freeform/freeform.config", () => ({
  default: { sites: { current: 1 } },
}));
vi.mock("react-router-dom", () => ({ useNavigate: () => fixture.navigate }));
vi.mock("@ff-client/contexts/site/site.context", () => ({
  useSiteContext: () => ({ current: fixture.currentSite }),
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string, params: Record<string, unknown> = {}) =>
    text.replace(/\{(\w+)\}/g, (_, key) => String(params[key])),
}));
vi.mock("@components/middleware/implementations", () => ({
  injectInto: (
    name: string,
    _options: unknown,
    _context: unknown,
    next: (target: unknown, handle: string) => void,
  ) => next(null, name.toLowerCase().replace(/\W/g, "")),
  handle: (value: string) => value,
}));
const properties = [
  { handle: "name", value: "" },
  {
    handle: "type",
    value: "Solspace\\Freeform\\Form\\Types\\Regular",
  },
  { handle: "formattingTemplate", value: "light.twig" },
  { handle: "storeData", value: true },
];
vi.mock("./modal.form.queries", () => ({
  useFetchFormModalType: () => ({ data: properties, isFetching: false }),
  useFormStartingPoints: () => ({
    isLoading: false,
    isError: fixture.optionsError,
    refetch: vi.fn(),
    data: fixture.optionsError
      ? undefined
      : {
          defaults: {
            formattingTemplate: "light.twig",
            storeData: true,
            successBehavior: "reload",
            successMessage: "Thanks",
            errorMessage: "Try again",
            returnUrl: "",
          },
          presets: [
            {
              id: "contact",
              label: "Contact",
              description: "A contact form.",
              fields: fixture.fields,
            },
            {
              id: "support",
              label: "Support request",
              description: "A support form.",
              fields: fixture.fields,
            },
          ],
        },
  }),
}));
vi.mock("@components/form-controls", () => ({
  FormComponent: ({
    property,
    value,
    updateValue,
    errors,
  }: {
    property: { handle: string };
    value: string | boolean;
    updateValue: (value: string | boolean) => void;
    errors?: string[];
  }) => (
    <label>
      {property.handle}
      {property.handle === "type" ? (
        <select
          aria-label="Form Type"
          value={String(value)}
          onChange={(event) => updateValue(event.target.value)}
        >
          <option value={"Solspace\\Freeform\\Form\\Types\\Regular"}>
            Regular
          </option>
          <option
            value={"Solspace\\Freeform\\Bundles\\Form\\Types\\Pages\\Page"}
          >
            Page
          </option>
        </select>
      ) : (
        <input
          aria-label={property.handle}
          type={property.handle === "storeData" ? "checkbox" : "text"}
          checked={value === true}
          value={typeof value === "string" ? value : ""}
          onChange={(event) =>
            updateValue(
              property.handle === "storeData"
                ? event.target.checked
                : event.target.value,
            )
          }
        />
      )}
      {errors?.map((error) => (
        <span key={error}>{error}</span>
      ))}
    </label>
  ),
}));
vi.mock("@components/elements/custom-dropdown/dropdown", () => ({
  Dropdown: ({
    value,
    options,
    onChange,
  }: {
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
  }) => (
    <div>
      <select
        aria-label="Starting point choices"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  ),
}));

let host: HTMLDivElement;
let root: Root;
const field = (name: string) =>
  host.querySelector<HTMLInputElement>(`input[aria-label="${name}"]`)!;
const create = () =>
  Array.from(host.querySelectorAll("button")).find((button) =>
    button.textContent?.includes("Create form"),
  )!;
function input(name: string, value: string) {
  act(() => {
    const el = field(name);
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
function select(value: string) {
  act(() => {
    const el = host.querySelector("select")!;
    el.value = value;
    el.dispatchEvent(new Event("change", { bubbles: true }));
  });
}
function selectType(value: string) {
  act(() => {
    const el = host.querySelector<HTMLSelectElement>(
      'select[aria-label="Form Type"]',
    )!;
    el.value = value;
    el.dispatchEvent(new Event("change", { bubbles: true }));
  });
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.clearAllMocks();
  fixture.optionsError = false;
  vi.mocked(axios.post).mockResolvedValue({ data: { id: 42 } });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root.render(<CreateFormModal closeModal={fixture.close} />));
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

it("defaults to a blank form and suggests names without replacing a custom name", () => {
  expect(host.querySelector("select")!.value).toBe("");
  expect(field("name").value).toBe("");
  select("contact");
  expect(field("name").value).toBe("Contact");
  select("support");
  expect(field("name").value).toBe("Support request");
  select("");
  expect(field("name").value).toBe("");
  select("contact");
  input("name", "Sales questions");
  select("support");
  expect(field("name").value).toBe("Sales questions");
  select("");
  expect(field("name").value).toBe("Sales questions");
});

it("keeps blank creation on the regular endpoint", async () => {
  input("name", "Empty form");
  await act(async () => create().click());
  expect(axios.post).toHaveBeenCalledWith("/api/forms/modal", {
    name: "Empty form",
    handle: "emptyform",
    type: "Solspace\\Freeform\\Form\\Types\\Regular",
    formattingTemplate: "light.twig",
    storeData: true,
    sites: [2],
  });
  expect(fixture.navigate).toHaveBeenCalledWith("/forms/42");
  expect(fixture.close).toHaveBeenCalledOnce();
});

it("creates a blank Page form when that type is selected", async () => {
  input("name", "Landing page");
  selectType("Solspace\\Freeform\\Bundles\\Form\\Types\\Pages\\Page");
  await act(async () => create().click());
  expect(axios.post).toHaveBeenCalledWith(
    "/api/forms/modal",
    expect.objectContaining({
      type: "Solspace\\Freeform\\Bundles\\Form\\Types\\Pages\\Page",
    }),
  );
});

it("creates samples with their original fields and the selected modal settings", async () => {
  select("contact");
  selectType("Solspace\\Freeform\\Bundles\\Form\\Types\\Pages\\Page");
  input("formattingTemplate", "custom.twig");
  act(() => field("storeData").click());
  await act(async () => create().click());
  expect(axios.post).toHaveBeenCalledOnce();
  expect(axios.post).toHaveBeenCalledWith(
    "/api/forms/wizard/create",
    expect.objectContaining({
      purpose: "contact",
      name: "Contact",
      type: "Solspace\\Freeform\\Bundles\\Form\\Types\\Pages\\Page",
      fields: fixture.fields,
      siteIds: [2],
      formattingTemplate: "custom.twig",
      storeData: false,
      adminEnabled: false,
      confirmationEnabled: false,
      requestToken: expect.any(String),
    }),
  );
  expect(fixture.navigate).toHaveBeenCalledWith("/forms/42");
});

it("does not submit when Enter selects a starting point", () => {
  select("contact");
  act(() =>
    host
      .querySelector("select")!
      .dispatchEvent(
        new KeyboardEvent("keyup", { key: "Enter", bubbles: true }),
      ),
  );
  const trigger = host.querySelector<HTMLDivElement>('[role="button"]')!;
  act(() =>
    trigger.dispatchEvent(
      new KeyboardEvent("keyup", { key: "Enter", bubbles: true }),
    ),
  );
  expect(axios.post).not.toHaveBeenCalled();
});

it("requires a name and lets blank creation work when presets fail to load", async () => {
  fixture.optionsError = true;
  act(() => root.render(<CreateFormModal closeModal={fixture.close} />));
  await act(async () => create().click());
  expect(host.textContent).toContain("Enter a name for your form.");
  expect(axios.post).not.toHaveBeenCalled();
  input("name", "Blank");
  await act(async () => create().click());
  expect(axios.post).toHaveBeenCalledWith(
    "/api/forms/modal",
    expect.objectContaining({ name: "Blank" }),
  );
});

it("reuses a sample request token on retry and shows server errors", async () => {
  select("contact");
  vi.mocked(axios.post).mockRejectedValueOnce({
    response: { data: { message: "The form could not be saved." } },
  });
  await act(async () => create().click());
  expect(host.textContent).toContain("The form could not be saved.");
  expect(fixture.close).not.toHaveBeenCalled();
  const token = (
    vi.mocked(axios.post).mock.calls[0][1] as { requestToken: string }
  ).requestToken;
  await act(async () => create().click());
  expect(
    (vi.mocked(axios.post).mock.calls[1][1] as { requestToken: string })
      .requestToken,
  ).toBe(token);
});

it("does not create twice when the button is clicked repeatedly", async () => {
  select("contact");
  let finish: (value: unknown) => void;
  vi.mocked(axios.post).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const button = create();
  act(() => {
    button.click();
    button.click();
  });
  expect(axios.post).toHaveBeenCalledOnce();
  expect(button.disabled).toBe(true);
  await act(async () => finish({ data: { id: 42 } }));
  expect(fixture.close).toHaveBeenCalledOnce();
});
