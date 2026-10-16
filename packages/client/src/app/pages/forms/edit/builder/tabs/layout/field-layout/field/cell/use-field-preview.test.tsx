import type { Field } from "@editor/store/slices/layout/fields";
import type { FieldType } from "@ff-client/types/fields";
import { PropertyType } from "@ff-client/types/properties";
import { configureStore } from "@reduxjs/toolkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { Provider, useSelector } from "react-redux";
import { afterEach, expect, it, vi } from "vitest";
import { useFieldPreview } from "./use-field-preview";

const fixture = vi.hoisted(() => ({
  compile: vi.fn(),
  render: vi.fn(),
  settings: [],
  pageType: {},
  site: { current: { id: 1 }, isPrimary: false },
}));
vi.mock("lodash/template", async (importOriginal) => {
  const { default: template } =
    await importOriginal<typeof import("lodash/template")>();
  return {
    default: (source: string) => {
      fixture.compile(source);
      const render = template(source);
      return (data: unknown) => {
        fixture.render(data);
        return render(data);
      };
    },
  };
});
vi.mock("@editor/store", async () => {
  const { useDispatch, useSelector } = await import("react-redux");
  return { useAppDispatch: useDispatch, useAppSelector: useSelector };
});
vi.mock("@config/freeform/freeform.config", () => ({
  default: { limitations: { can: () => true } },
}));
vi.mock("@ff-client/contexts/site/site.context", () => ({
  useSiteContext: () => fixture.site,
}));
vi.mock("@ff-client/queries/forms", () => ({
  useQueryFormSettings: () => ({ data: fixture.settings }),
}));
vi.mock("@ff-client/queries/page-types", () => ({
  useFetchPageButtonType: () => ({ data: fixture.pageType }),
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (value: string) => value,
}));

afterEach(() => {
  fixture.compile.mockClear();
  fixture.render.mockClear();
});

it("reuses templates and preview data across selection, while updating edits and translations", async () => {
  const fields = Array.from({ length: 145 }, (_, index) => ({
    uid: `field-${index}`,
    typeClass: "Text",
    properties: { label: `Field ${index}`, placeholder: "Initial" },
  })) as Field[];
  const store = configureStore({
    reducer: {
      form: () => ({ settings: { general: { translations: true } } }),
      layout: (state = { fields }, action) =>
        action.type === "edit"
          ? {
              fields: state.fields.map((field, index) =>
                index === 72
                  ? {
                      ...field,
                      properties: {
                        ...field.properties,
                        placeholder: "Edited",
                      },
                    }
                  : field,
              ),
            }
          : state,
      translations: (state = {}, action) =>
        action.type === "translate"
          ? { 1: { fields: { "field-72": { placeholder: "Translated" } } } }
          : state,
    },
  });
  const type = {
    type: "text",
    typeClass: "Text",
    implements: [],
    properties: [
      { handle: "placeholder", type: PropertyType.String, translatable: true },
    ],
    previewTemplate: '<input placeholder="<%- placeholder %>">',
  } as FieldType;
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  client.setQueryData(["field-types"], [type]);
  const Cell = ({ uid, selection }: { uid: string; selection: number }) => {
    const field = useSelector(
      (state: ReturnType<typeof store.getState>) =>
        state.layout.fields.find((item) => item.uid === uid)!,
    );
    const [html] = useFieldPreview(field, type);
    return (
      <div
        data-selection={selection}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  };
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const view = (selection: number) => (
    <Provider store={store}>
      <QueryClientProvider client={client}>
        {fields.map((field) => (
          <Cell key={field.uid} uid={field.uid} selection={selection} />
        ))}
      </QueryClientProvider>
    </Provider>
  );
  try {
    await act(async () => root.render(view(0)));
    expect(fixture.compile).toHaveBeenCalledTimes(1);
    expect(fixture.render).toHaveBeenCalledTimes(145);
    fixture.render.mockClear();
    await act(async () => root.render(view(1)));
    expect(fixture.compile).toHaveBeenCalledTimes(1);
    expect(fixture.render).not.toHaveBeenCalled();
    await act(async () => {
      store.dispatch({ type: "edit" });
    });
    expect(fixture.compile).toHaveBeenCalledTimes(1);
    expect(fixture.render).toHaveBeenCalledTimes(1);
    expect(host.querySelectorAll("input")[72].placeholder).toBe("Edited");
    fixture.render.mockClear();
    await act(async () => {
      store.dispatch({ type: "translate" });
    });
    expect(fixture.render).toHaveBeenCalledTimes(1);
    expect(host.querySelectorAll("input")[72].placeholder).toBe("Translated");
  } finally {
    await act(async () => root.unmount());
    host.remove();
    client.clear();
  }
}, 20000);
