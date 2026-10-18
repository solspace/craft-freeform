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
  fieldType: "text",
  markup: "<input />",
  translatedContent: undefined as string | undefined,
}));
vi.mock("@editor/store", () => ({
  useAppDispatch: () => fixture.dispatch,
}));
vi.mock("@ff-client/queries/field-types", () => ({
  useFieldType: () => ({
    type: fixture.fieldType,
    name: "Text",
    implements: [],
    icon: "",
  }),
}));
vi.mock("@editor/store/slices/translations/translations.hooks", () => ({
  useTranslations: () => ({
    getTranslation: (key: string, value: unknown) =>
      key === "content" && fixture.translatedContent !== undefined
        ? fixture.translatedContent
        : value,
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
    return [fixture.markup, fixture.loading];
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
  fixture.fieldType = "text";
  fixture.markup = "<input />";
  fixture.translatedContent = undefined;
  fixture.dispatch.mockClear();
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

const renderContentField = async (
  type: string,
  content: string,
  markup = content,
) => {
  fixture.fieldType = type;
  fixture.markup = markup;
  const store = configureStore({ reducer: { context } });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  const field = {
    uid: "content-field",
    typeClass: type,
    properties: { label: "Internal block name", content },
  } as Field;
  await act(async () =>
    root!.render(
      <Provider store={store}>
        <FieldCell field={field} />
      </Provider>,
    ),
  );
  return { store, field };
};

it.each(["html", "rich-text"])(
  "shows only the content of a populated %s field and keeps it selectable",
  async (type) => {
    await renderContentField(type, "<h2>Client information</h2>");
    expect(host!.querySelector(".label")).toBeNull();
    expect(host!.textContent).toBe("Client information");
    act(() => host!.querySelector<HTMLElement>(".field")!.click());
    expect(fixture.dispatch).toHaveBeenCalledWith(
      contextActions.setFocusedItem({
        type: FocusType.Field,
        uid: "content-field",
      }),
    );
  },
);

for (const type of ["html", "rich-text"]) {
  it.each([
    ["", "This field has not been configured yet."],
    ["   ", "   "],
    ["<p><br></p>", "<p><br></p>"],
    ["<p>&nbsp;</p>", "<p>&nbsp;</p>"],
    ["<!-- Comment only -->", "<!-- Comment only -->"],
    ["<script>alert(1)</script>", "<script>alert(1)</script>"],
  ])(
    `keeps the name of an empty ${type} field (%s)`,
    async (content, markup) => {
      await renderContentField(type, content, markup);
      expect(host!.querySelector(".label")?.textContent).toBe(
        "Internal block name",
      );
    },
  );
}

it.each(["html", "rich-text"])("treats media as %s content", async (type) => {
  await renderContentField(type, '<img src="/image.png" alt="Logo">');
  expect(host!.querySelector(".label")).toBeNull();
  expect(host!.querySelector("img")?.getAttribute("alt")).toBe("Logo");
});

it("uses translated content to decide whether to show the block name", async () => {
  fixture.translatedContent = "";
  const { store, field } = await renderContentField(
    "rich-text",
    "<h2>Original heading</h2>",
    "This field has not been configured yet.",
  );
  expect(host!.querySelector(".label")?.textContent).toBe(
    "Internal block name",
  );

  fixture.translatedContent = "<h2>Translated heading</h2>";
  fixture.markup = fixture.translatedContent;
  await act(async () =>
    root!.render(
      <Provider store={store}>
        <FieldCell field={{ ...field }} />
      </Provider>,
    ),
  );
  expect(host!.querySelector(".label")).toBeNull();
  expect(host!.textContent).toBe("Translated heading");

  fixture.translatedContent = "";
  fixture.markup = "<p><br></p>";
  await act(async () =>
    root!.render(
      <Provider store={store}>
        <FieldCell field={{ ...field }} />
      </Provider>,
    ),
  );
  expect(host!.querySelector(".label")?.textContent).toBe(
    "Internal block name",
  );
});

it("keeps labels on regular input fields", async () => {
  await renderContentField("text", "Not content", "<input>");
  expect(host!.querySelector(".label")?.textContent).toBe(
    "Internal block name",
  );
});
