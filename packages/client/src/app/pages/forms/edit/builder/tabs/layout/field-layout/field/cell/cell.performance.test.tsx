import context, {
  contextActions,
  FocusType,
} from "@editor/store/slices/context";
import type { Field } from "@editor/store/slices/layout/fields";
import { configureStore } from "@reduxjs/toolkit";
import DOMPurify from "dompurify";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Provider } from "react-redux";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { FieldCell } from "./cell";

const fixture = vi.hoisted(() => ({
  preview: vi.fn(),
  dispatch: vi.fn(),
  loading: false,
}));
vi.mock("@editor/store", () => ({
  useAppDispatch: () => fixture.dispatch,
}));
vi.mock("@ff-client/queries/field-types", () => ({
  useFieldType: () => ({
    type: "text",
    name: "Text",
    implements: [],
    icon: "",
  }),
}));
vi.mock("@editor/store/slices/translations/translations.hooks", () => ({
  useTranslations: () => ({
    getTranslation: (_key: string, value: unknown) => value,
  }),
}));
vi.mock("../../layout/group-field-layout/group-field-layout", () => ({
  GroupFieldLayout: () => null,
}));
vi.mock("./cell-badges", () => ({ FieldAssociationsBadges: () => null }));
vi.mock("./cell.animations", () => ({ useLoaderAnimation: () => [{}, {}] }));
vi.mock("./use-field-preview", () => ({
  useFieldPreview: (field: Field) => {
    fixture.preview(field.uid);
    return ["<input />", fixture.loading];
  },
}));

beforeEach(() => vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true));

let root: Root | undefined;
let host: HTMLDivElement | undefined;
afterEach(async () => {
  await act(async () => root?.unmount());
  host?.remove();
  fixture.preview.mockClear();
  fixture.loading = false;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("only rerenders the old and new selected field in a 145-field layout", async () => {
  const store = configureStore({ reducer: { context } });
  const fields = Array.from({ length: 145 }, (_, index) => ({
    uid: `field-${index}`,
    typeClass: "Text",
    properties: { label: `Field ${index}` },
  })) as Field[];
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  const sanitize = vi.spyOn(DOMPurify, "sanitize");
  const view = () => (
    <Provider store={store}>
      {fields.map((field) => (
        <FieldCell key={field.uid} field={field} />
      ))}
    </Provider>
  );
  await act(async () => root!.render(view()));
  expect(fixture.preview).toHaveBeenCalledTimes(145);
  expect(host.querySelectorAll(".spinner-path")).toHaveLength(0);

  fixture.preview.mockClear();
  sanitize.mockClear();
  const originalInput = host.querySelector("input");
  await act(async () => {
    store.dispatch(
      contextActions.setFocusedItem({ type: FocusType.Field, uid: "field-0" }),
    );
  });
  expect(fixture.preview.mock.calls).toEqual([["field-0"]]);
  expect(sanitize).not.toHaveBeenCalled();
  expect(host.querySelector("input")).toBe(originalInput);

  fixture.preview.mockClear();
  await act(async () => {
    store.dispatch(
      contextActions.setFocusedItem({
        type: FocusType.Field,
        uid: "field-144",
      }),
    );
  });
  expect(fixture.preview.mock.calls.map(([uid]) => uid).sort()).toEqual([
    "field-0",
    "field-144",
  ]);
  expect(host.querySelectorAll(".field.active")).toHaveLength(1);
  expect(sanitize).not.toHaveBeenCalled();

  fixture.preview.mockClear();
  await act(async () => root!.render(view()));
  expect(fixture.preview).not.toHaveBeenCalled();
}, 20000);

it("runs spinner animations only while a field preview is loading", async () => {
  const store = configureStore({ reducer: { context } });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  const field = {
    uid: "field",
    typeClass: "Text",
    properties: { label: "Field" },
  } as Field;
  fixture.loading = true;
  await act(async () =>
    root!.render(
      <Provider store={store}>
        <FieldCell field={field} />
      </Provider>,
    ),
  );
  expect(host.querySelectorAll(".spinner-path")).toHaveLength(1);
  fixture.loading = false;
  await act(async () =>
    root!.render(
      <Provider store={store}>
        <FieldCell field={{ ...field }} />
      </Provider>,
    ),
  );
  expect(host.querySelectorAll(".spinner-path")).toHaveLength(0);
});
