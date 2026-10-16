import type { Field } from "@editor/store/slices/layout/fields";
import { configureStore } from "@reduxjs/toolkit";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { expect, it, vi } from "vitest";
import { Row } from "./row";

const fixture = vi.hoisted(() => ({ render: vi.fn() }));
vi.mock("@ff-client/hooks/use-height-animation", async () => {
  const { useRef } = await import("react");
  return {
    useDimensionsObserver: () => ({
      ref: useRef<HTMLDivElement>(null),
      dimensions: { width: 900, height: 72 },
    }),
  };
});
vi.mock("./row.animations", () => ({
  usePlaceholderAnimation: () => ({}),
  useRowAnimation: () => ({}),
}));
vi.mock("./row.drop", () => ({ useRowDrop: () => ({ ref: () => {} }) }));
vi.mock("./row.field-drop", () => ({
  useRowFieldDrop: () => ({ ref: (ref: unknown) => ref }),
}));
vi.mock("../field/field.placeholder", () => ({
  FieldDragPlaceholder: () => null,
}));
vi.mock("../field/field", () => ({
  Field: ({ field }: { field: Field }) => {
    fixture.render(field.uid);
    return <span>{field.properties.label}</span>;
  },
}));

it("keeps the other 144 rows unchanged when one field is edited", async () => {
  const fields = Array.from({ length: 145 }, (_, index) => ({
    uid: `field-${index}`,
    rowUid: `row-${index}`,
    typeClass: "Text",
    properties: { label: `Field ${index}` },
  })) as Field[];
  const store = configureStore({
    reducer: {
      layout: (state = { fields }, action) =>
        action.type === "rename"
          ? {
              fields: state.fields.map((field, index) =>
                index === 72
                  ? {
                      ...field,
                      properties: {
                        ...field.properties,
                        label: "Updated label",
                      },
                    }
                  : field,
              ),
            }
          : state,
    },
  });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () =>
      root.render(
        <Provider store={store}>
          {fields.map((field, order) => (
            <Row
              key={field.rowUid}
              row={{ uid: field.rowUid, layoutUid: "layout", order }}
            />
          ))}
        </Provider>,
      ),
    );
    expect(fixture.render).toHaveBeenCalledTimes(145);
    fixture.render.mockClear();
    await act(async () => {
      store.dispatch({ type: "rename" });
    });
    expect(fixture.render.mock.calls).toEqual([["field-72"]]);
    expect(host.textContent).toContain("Updated label");
    expect(host.querySelectorAll("span")).toHaveLength(145);
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});
