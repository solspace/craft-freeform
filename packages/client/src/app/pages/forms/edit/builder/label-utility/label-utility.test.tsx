import { reducer } from "@editor/store";
import { historyActions } from "@editor/store/history";
import { createHistoryMiddleware } from "@editor/store/middleware/history";
import { formActions } from "@editor/store/slices/form";
import { fieldActions } from "@editor/store/slices/layout/fields";
import { pageActions } from "@editor/store/slices/layout/pages";
import { rowActions } from "@editor/store/slices/layout/rows";
import { translationActions } from "@editor/store/slices/translations";
import { configureStore } from "@reduxjs/toolkit";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Provider } from "react-redux";
import { afterEach, expect, it, vi } from "vitest";
import { LabelUtilityEditor } from "./label-utility";

const fixture = vi.hoisted(() => ({
  isPrimary: true,
  translations: false,
  firstLabel: "first name:",
  secondLabel: "email",
  secondType: "Text",
}));
vi.mock("@ff-client/contexts/site/site.context", () => ({
  useSiteContext: () => ({
    current: { id: 2, name: "French" },
    isPrimary: fixture.isPrimary,
  }),
}));
vi.mock("@ff-client/queries/field-types", () => ({
  useFetchFieldTypes: () => ({
    data: [
      {
        typeClass: "Text",
        type: "text",
        name: "Text",
        implements: [] as string[],
        properties: [{ handle: "label", translatable: true }],
      },
      {
        typeClass: "Checkbox",
        type: "checkbox",
        name: "Checkbox",
        implements: ["noLabel"],
        properties: [{ handle: "label", translatable: true }],
      },
    ],
    isFetching: false,
  }),
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (value: string, params: Record<string, string> = {}) =>
    Object.entries(params).reduce(
      (text, [key, replacement]) =>
        text.replace(`{${key}}`, String(replacement)),
      value,
    ),
}));
let root: Root;
let host: HTMLDivElement;
const close = vi.fn();
const dialogMethods = new Map(
  ["showModal", "close"].map((method) => [
    method,
    Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, method),
  ]),
);
const setup = () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  // JSDOM lacks the native dialog lifecycle; keyboard/focus behavior is checked
  // in the browser, while these tests verify the confirmation and state writes.
  for (const method of dialogMethods.keys())
    Object.defineProperty(HTMLDialogElement.prototype, method, {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.open = method === "showModal";
      },
    });
  const store = configureStore({
    reducer,
    middleware: (defaults) => defaults().concat(createHistoryMiddleware()),
  });
  store.dispatch(
    pageActions.set([
      { uid: "p1", label: "Contact", layoutUid: "l1", order: 0 },
      { uid: "p2", label: "Details", layoutUid: "l2", order: 1 },
    ]),
  );
  store.dispatch(
    rowActions.set([
      { uid: "r1", layoutUid: "l1", order: 0 },
      { uid: "r2", layoutUid: "l2", order: 0 },
    ]),
  );
  store.dispatch(
    fieldActions.set([
      {
        uid: "a",
        id: 101,
        typeClass: "Text",
        rowUid: "r1",
        properties: {
          label: fixture.firstLabel,
          handle: "firstName",
          placeholder: "Sample",
        },
      },
      {
        uid: "b",
        id: 102,
        typeClass: fixture.secondType,
        rowUid: "r2",
        properties: { label: fixture.secondLabel, handle: "email" },
      },
    ]),
  );
  store.dispatch(
    formActions.modifySettings({
      namespace: "general",
      key: "translations",
      value: fixture.translations,
    }),
  );
  store.dispatch(
    translationActions.init({
      2: { fields: { a: { label: "prénom:" } }, form: {}, pages: {} },
      3: { fields: { a: { label: "Voornaam" } }, form: {}, pages: {} },
    }),
  );
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() =>
    root.render(
      <Provider store={store}>
        <LabelUtilityEditor close={close} />
      </Provider>,
    ),
  );
  return store;
};
const choose = (id: string, value: string) =>
  act(() => {
    const select = host.querySelector<HTMLSelectElement>(
      `#label-utility-${id}`,
    )!;
    select.value = value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
const requestConfirmation = async () => {
  await act(async () =>
    host.querySelector<HTMLButtonElement>("button.submit")!.click(),
  );
};
const apply = async () => {
  await requestConfirmation();
  await act(async () =>
    host.querySelector<HTMLButtonElement>("dialog button.submit")!.click(),
  );
};
afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  close.mockClear();
  vi.restoreAllMocks();
  for (const [method, descriptor] of dialogMethods)
    if (descriptor)
      Object.defineProperty(HTMLDialogElement.prototype, method, descriptor);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, method);
  fixture.isPrimary = true;
  fixture.translations = false;
  fixture.firstLabel = "first name:";
  fixture.secondLabel = "email";
  fixture.secondType = "Text";
  vi.unstubAllGlobals();
});

it("previews the entire form by default without changing it and cancels cleanly", () => {
  const store = setup();
  const before = store.getState();
  choose("case", "title");
  choose("colons", "remove");
  expect(host.querySelectorAll("tbody tr")).toHaveLength(2);
  expect(host.textContent).toContain("First Name");
  expect(store.getState()).toBe(before);
  act(() =>
    host.querySelector<HTMLButtonElement>(".btn:not(.submit)")!.click(),
  );
  expect(close).toHaveBeenCalledOnce();
  expect(store.getState()).toBe(before);
});
it("applies selected changes in a single undo step without changing handles or other properties", async () => {
  const store = setup();
  const original = store.getState().layout.fields;
  choose("case", "title");
  choose("colons", "remove");
  await apply();
  expect(
    store.getState().layout.fields.map((field) => field.properties.label),
  ).toEqual(["First Name", "Email"]);
  expect(store.getState().layout.fields[0].properties).toEqual({
    label: "First Name",
    handle: "firstName",
    placeholder: "Sample",
  });
  expect(store.getState().history.undoCount).toBe(1);
  act(() => store.dispatch(historyActions.undo()));
  expect(store.getState().layout.fields).toEqual(original);
  act(() => store.dispatch(historyActions.redo()));
  expect(store.getState().layout.fields[1].properties.label).toBe("Email");
});
it("limits changes to the current page and allows opting individual labels out", async () => {
  const store = setup();
  choose("case", "upper");
  choose("scope", "page");
  expect(host.querySelectorAll("tbody tr")).toHaveLength(1);
  const checkbox = host.querySelector<HTMLInputElement>("tbody input")!;
  act(() => checkbox.click());
  expect(host.querySelector<HTMLButtonElement>("button.submit")!.disabled).toBe(
    true,
  );
  act(() => checkbox.click());
  await apply();
  expect(
    store.getState().layout.fields.map((field) => field.properties.label),
  ).toEqual(["FIRST NAME:", "email"]);
});
it("updates selected-site translations, including inherited labels, and undoes them together", async () => {
  fixture.isPrimary = false;
  fixture.translations = true;
  const store = setup();
  const original = store.getState().translations;
  choose("case", "upper");
  await apply();
  expect(store.getState().translations[2].fields).toEqual({
    a: { label: "PRÉNOM:" },
    b: { label: "EMAIL" },
  });
  expect(store.getState().layout.fields[0].properties.label).toBe(
    "first name:",
  );
  expect(store.getState().translations[3]).toEqual(original[3]);
  expect(store.getState().history.undoCount).toBe(1);
  act(() => store.dispatch(historyActions.undo()));
  expect(store.getState().translations).toEqual(original);
});

const fill = (id: string, value: string) =>
  act(() => {
    const input = host.querySelector<HTMLInputElement>(`#label-utility-${id}`)!;
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
const toggleOption = (name: string) =>
  act(() => {
    Array.from(host.querySelectorAll("label"))
      .find((label) => label.textContent?.trim() === name)!
      .control!.click();
  });
it("previews literal replacements with optional matching case, then applies and undoes them together", async () => {
  fixture.firstLabel = "Phone PHONE";
  fixture.secondLabel = "phone";
  const store = setup();
  fill("find", "Phone");
  fill("replacement", "$& number");
  expect(host.querySelectorAll("tbody tr")).toHaveLength(2);
  expect(host.querySelector("tbody tr td:last-child")!.textContent).toBe(
    "$& number $& number",
  );
  toggleOption("Match case");
  expect(host.querySelectorAll("tbody tr")).toHaveLength(1);
  expect(store.getState().layout.fields[0].properties.label).toBe(
    "Phone PHONE",
  );
  const identities = store
    .getState()
    .layout.fields.map(({ id, uid, rowUid, typeClass, properties }) => ({
      id,
      uid,
      rowUid,
      typeClass,
      handle: properties.handle,
    }));
  const rules = store.getState().rules;
  const integrations = store.getState().integrations;
  await apply();
  expect(store.getState().layout.fields[0].properties.label).toBe(
    "$& number PHONE",
  );
  expect(store.getState().layout.fields[1].properties.label).toBe("phone");
  expect(
    store
      .getState()
      .layout.fields.map(({ id, uid, rowUid, typeClass, properties }) => ({
        id,
        uid,
        rowUid,
        typeClass,
        handle: properties.handle,
      })),
  ).toEqual(identities);
  expect(store.getState().rules).toBe(rules);
  expect(store.getState().integrations).toBe(integrations);
  expect(store.getState().history.undoCount).toBe(1);
  act(() => store.dispatch(historyActions.undo()));
  expect(store.getState().layout.fields[0].properties.label).toBe(
    "Phone PHONE",
  );
});
it("cleans spacing and preserves acronyms by default with an opt-out", async () => {
  fixture.firstLabel = "  Customer   ID: ";
  fixture.secondLabel = "PDF URL";
  const store = setup();
  choose("case", "sentence");
  choose("colons", "remove");
  toggleOption("Clean up spacing");
  expect(host.querySelector("tbody tr td:last-child")!.textContent).toBe(
    "Customer ID",
  );
  toggleOption("Preserve common acronyms");
  expect(host.querySelector("tbody tr td:last-child")!.textContent).toBe(
    "Customer id",
  );
  toggleOption("Preserve common acronyms");
  await apply();
  expect(
    store.getState().layout.fields.map((field) => field.properties.label),
  ).toEqual(["Customer ID", "PDF URL"]);
});
it("filters types independently of individual label selections and keeps excluded checkbox labels unchanged", async () => {
  fixture.secondType = "Checkbox";
  fixture.secondLabel = "Accept terms";
  const store = setup();
  choose("colons", "add");
  // The first label already has its colon, so only the checkbox is a proposed change.
  expect(host.querySelectorAll("tbody tr")).toHaveLength(1);
  act(() =>
    host
      .querySelector<HTMLInputElement>(
        'input[aria-label="Include Checkbox labels"]',
      )!
      .click(),
  );
  expect(host.querySelector<HTMLButtonElement>("button.submit")!.disabled).toBe(
    true,
  );
  const selectTypes = host.querySelector<HTMLButtonElement>(
    "button.utility-select-types",
  )!;
  expect(selectTypes.textContent).toBe("Select All");
  act(() => selectTypes.click());
  expect(host.querySelectorAll("tbody tr")).toHaveLength(1);
  expect(selectTypes.textContent).toBe("Deselect All");
  act(() =>
    host
      .querySelector<HTMLInputElement>(
        'input[aria-label="Include Checkbox labels"]',
      )!
      .click(),
  );
  choose("colons", "remove");
  await apply();
  expect(
    store.getState().layout.fields.map((field) => field.properties.label),
  ).toEqual(["first name", "Accept terms"]);
  act(() => store.dispatch(historyActions.undo()));
  expect(store.getState().layout.fields[0].properties.label).toBe(
    "first name:",
  );
});
it("supports selecting no field types and blocks replacements that would leave blank labels", () => {
  setup();
  fill("find", "email");
  expect(host.textContent).toContain("One change would leave an empty label");
  expect(host.querySelector<HTMLButtonElement>("button.submit")!.disabled).toBe(
    true,
  );
  act(() =>
    host
      .querySelector<HTMLButtonElement>("button.utility-select-types")!
      .click(),
  );
  expect(host.textContent).toContain(
    "No labels match the selected field types.",
  );
});

it("shows acronym controls only for supported capitalization without losing the setting", () => {
  setup();
  const acronyms = () =>
    Array.from(host.querySelectorAll("label")).find(
      (label) => label.textContent === "Preserve common acronyms",
    )?.control as HTMLInputElement | undefined;
  expect(acronyms()).toBeUndefined();
  choose("case", "title");
  expect(acronyms()?.checked).toBe(true);
  toggleOption("Preserve common acronyms");
  choose("case", "upper");
  expect(acronyms()).toBeUndefined();
  choose("case", "sentence");
  expect(acronyms()?.checked).toBe(false);
});

it("marks only changed preview text and keeps the exact label value when applied", async () => {
  fixture.firstLabel = "Insured:";
  const store = setup();
  fill("find", "Insur");
  fill("replacement", "Ansur");
  choose("colons", "remove");
  expect(
    Array.from(host.querySelectorAll(".utility-label-current mark")).map(
      (mark) => mark.textContent,
    ),
  ).toEqual(["I", ":"]);
  expect(host.querySelector(".utility-label-updated mark")?.textContent).toBe(
    "A",
  );
  await apply();
  expect(store.getState().layout.fields[0].properties.label).toBe("Ansured");
  expect(store.getState().layout.fields[0].properties.handle).toBe("firstName");
});

it("leaves the preview and form unchanged when confirmation is cancelled", async () => {
  const store = setup();
  choose("colons", "remove");
  const original = store.getState();
  await requestConfirmation();
  expect(host.querySelector("dialog h2")?.textContent).toBe("Update 1 label?");
  expect(store.getState()).toBe(original);
  act(() =>
    host.querySelector<HTMLButtonElement>("dialog button.cancel")!.click(),
  );
  expect(host.querySelector("dialog")).toBeNull();
  expect(store.getState()).toBe(original);
  expect(close).not.toHaveBeenCalled();
  expect(host.querySelectorAll("tbody tr")).toHaveLength(1);
  expect(host.querySelector<HTMLButtonElement>("button.submit")!.disabled).toBe(
    false,
  );
});

it("requires confirming the selected count and lets Escape return to the preview", async () => {
  const store = setup();
  choose("case", "title");
  const original = store.getState();
  await requestConfirmation();
  const dialog = host.querySelector<HTMLDialogElement>("dialog")!;
  expect(dialog.open).toBe(true);
  expect(dialog.querySelector("h2")?.textContent).toBe("Update 2 labels?");
  expect(dialog.textContent).toContain("Field handles remain unchanged.");
  expect(store.getState()).toBe(original);
  const confirm = dialog.querySelector<HTMLButtonElement>("button.submit")!;
  const cancel = dialog.querySelector<HTMLButtonElement>("button.cancel")!;
  confirm.focus();
  act(() =>
    confirm.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
        cancelable: true,
      }),
    ),
  );
  expect(document.activeElement).toBe(cancel);
  act(() =>
    cancel.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      }),
    ),
  );
  expect(document.activeElement).toBe(confirm);
  act(() =>
    confirm.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true,
      }),
    ),
  );
  expect(host.querySelector("dialog")).toBeNull();
  expect(close).not.toHaveBeenCalled();
  expect(store.getState()).toBe(original);
  await apply();
  expect(
    store.getState().layout.fields.map((field) => field.properties.label),
  ).toEqual(["First Name:", "Email"]);
  expect(store.getState().history.undoCount).toBe(1);
});
