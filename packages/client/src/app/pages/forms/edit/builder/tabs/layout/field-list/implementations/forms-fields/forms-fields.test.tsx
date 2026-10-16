import { reducer } from "@editor/store";
import { formActions } from "@editor/store/slices/form";
import { Search, searchActions } from "@editor/store/slices/search";
import { configureStore } from "@reduxjs/toolkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Provider } from "react-redux";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { FormsFields } from "./forms-fields";

const fixture = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("axios", () => ({ default: { get: fixture.get } }));
vi.mock("@ff-client/contexts/site/site.context", () => ({
  useSiteContext: () => ({ current: { handle: "default" } }),
}));
vi.mock("@ff-client/queries/field-types", () => ({
  useFieldTypeSearch: () => () => ({ visible: true }),
}));
vi.mock("./form-block.animations", () => ({
  useFormBlockAnimations: () => ({}),
}));
vi.mock("./field-item", () => ({
  FieldItem: ({ field }: { field: { label: string } }) => (
    <button type="button" data-shared-field>
      {field.label}
    </button>
  ),
}));

const forms = [
  {
    uid: "current",
    name: "Current",
    fields: [{ id: 1, label: "Current field" }],
  },
  {
    uid: "other",
    name: "Other form",
    fields: [
      { id: 2, label: "Shared email", typeClass: "Text" },
      { id: 3, label: "Shared name", typeClass: "Text" },
    ],
  },
];
let host: HTMLDivElement;
let root: Root;
let client: QueryClient;
let editorStore: ReturnType<typeof configureStore>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  fixture.get.mockReset().mockResolvedValue({ data: forms });
  client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  editorStore = configureStore({ reducer });
  editorStore.dispatch(formActions.update({ uid: "current" }));
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  client.clear();
  vi.unstubAllGlobals();
});
const settle = async () => {
  await act(async () => new Promise((resolve) => setTimeout(resolve, 20)));
};
const mount = async () => {
  await act(async () =>
    root.render(
      <Provider store={editorStore}>
        <QueryClientProvider client={client}>
          <FormsFields />
        </QueryClientProvider>
      </Provider>,
    ),
  );
  await settle();
};
const toggle = () =>
  host.querySelector<HTMLButtonElement>("button[aria-controls]")!;
it("does not fetch until opened, mounts only expanded form fields, and reuses the cached result", async () => {
  let resolve: (value: unknown) => void;
  fixture.get.mockReturnValue(
    new Promise((done) => {
      resolve = done;
    }),
  );
  await mount();
  expect(toggle().getAttribute("aria-expanded")).toBe("false");
  expect(fixture.get).not.toHaveBeenCalled();
  await act(async () => toggle().click());
  expect(host.querySelector('[role="status"]')?.textContent).toBe("Loading...");
  expect(fixture.get).toHaveBeenCalledWith("/api/fields/forms", {
    params: { site: "default" },
  });
  await act(async () => resolve!({ data: forms }));
  await settle();
  expect(host.textContent).not.toContain("Current field");
  expect(host.textContent).toContain("Other form");
  expect(host.querySelectorAll("[data-shared-field]")).toHaveLength(0);
  const formToggle = host.querySelector<HTMLButtonElement>(
    'button[aria-expanded="false"]',
  )!;
  await act(async () => formToggle.click());
  expect(host.querySelectorAll("[data-shared-field]")).toHaveLength(2);
  await act(async () => formToggle.click());
  expect(host.querySelectorAll("[data-shared-field]")).toHaveLength(0);
  await act(async () => toggle().click());
  await act(async () => toggle().click());
  await settle();
  expect(fixture.get).toHaveBeenCalledTimes(1);
});
it("loads and expands matching shared fields when searching without opening the section first", async () => {
  await mount();
  await act(async () =>
    editorStore.dispatch(
      searchActions.update({ type: Search.Fields, query: "email" }),
    ),
  );
  await settle();
  expect(fixture.get).toHaveBeenCalledTimes(1);
  expect(toggle().getAttribute("aria-expanded")).toBe("true");
  expect(host.querySelectorAll("[data-shared-field]")).toHaveLength(1);
  expect(host.textContent).toContain("Shared email");
  expect(host.textContent).not.toContain("Shared name");
  await act(async () =>
    editorStore.dispatch(searchActions.clear(Search.Fields)),
  );
  expect(toggle().getAttribute("aria-expanded")).toBe("false");
  expect(host.querySelectorAll("[data-shared-field]")).toHaveLength(0);
});
it("shows a failed lazy request as an error", async () => {
  fixture.get.mockRejectedValue(new Error("Unable to load fields"));
  await mount();
  await act(async () => toggle().click());
  await settle();
  expect(host.querySelector('[role="alert"]')?.textContent).toContain(
    "Unable to load fields",
  );
});
