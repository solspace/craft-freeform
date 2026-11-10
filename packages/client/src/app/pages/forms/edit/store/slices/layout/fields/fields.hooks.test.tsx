import { findOptionByValue } from "@components/elements/custom-dropdown/dropdown.operations";
import type { OptionCollection } from "@ff-client/types/properties";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { Field } from ".";
import { useFieldOptionCollection } from "./fields.hooks";

type FixtureState = {
  pages: { uid: string; label: string }[];
  cartographed: { page: string; fields: Field[] }[];
  groups: Record<string, Field[]>;
  translations: Record<number, { fields: Record<string, { label: string }> }>;
};

const { state } = vi.hoisted(() => ({
  state: {
    pages: [],
    cartographed: [],
    groups: {},
    translations: {},
  } as FixtureState,
}));
vi.mock("@editor/store", () => ({
  useAppStore: () => ({ getState: () => state }),
}));
vi.mock("react-redux", () => ({
  useSelector: (selector: (state: unknown) => unknown) => selector(state),
}));
vi.mock("@ff-client/queries/field-types", () => ({
  useFieldTypeSearch: () => (type: string) => ({ type }),
}));
vi.mock("@ff-client/contexts/site/site.context", () => ({
  useSiteContext: () => ({ current: { id: 1 } }),
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (value: string) => value,
}));
vi.mock("../layouts/layouts.selectors", () => ({
  layoutSelectors: {
    cartographed: {
      pageFieldList: () => state.cartographed,
      layoutFieldList: (_state: unknown, layout: string) =>
        state.groups[layout] ?? [],
    },
  },
}));
vi.mock("../pages/pages.selectors", () => ({
  pageSelecors: { all: () => state.pages },
}));

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
let options: OptionCollection;
const Harness = ({
  mapping = false,
  excluded = [],
}: {
  mapping?: boolean;
  excluded?: string[];
}) => {
  options = useFieldOptionCollection(undefined, excluded, mapping);
  return null;
};

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  root = createRoot(container);
  state.pages = [{ uid: "page", label: "Page 1" }];
  state.translations = { 1: { fields: { location: { label: "Bureau" } } } };
  state.cartographed = [
    {
      page: "page",
      fields: [
        {
          uid: "group",
          typeClass: "group",
          properties: { label: "Contact", layout: "nested" },
        },
      ],
    },
  ];
  state.groups = {
    nested: [
      {
        uid: "location",
        typeClass: "location",
        properties: {
          label: "Office",
          addressFields: "included",
          includedComponents: ["city", "country"],
        },
      },
    ],
  };
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

it("offers translated included Location components inside groups for mapping controls", () => {
  act(() => root.render(<Harness mapping />));
  expect(findOptionByValue(options, "location.city")?.label).toBe(
    "Bureau — City",
  );
  expect(findOptionByValue(options, "location.countryCode")?.label).toBe(
    "Bureau — Country Code",
  );
  expect(findOptionByValue(options, "location.line1")).toBeUndefined();
  expect(findOptionByValue(options, "location")?.label).toBe("Bureau");
});

it("keeps ordinary field controls limited to actual fields", () => {
  act(() => root.render(<Harness />));
  expect(findOptionByValue(options, "location")?.label).toBe("Bureau");
  expect(findOptionByValue(options, "location.city")).toBeUndefined();
});

it("uses actual mapped fields instead of adding included component choices in mapped mode", () => {
  state.groups.nested[0].properties.addressFields = "mapped";
  act(() => root.render(<Harness mapping />));
  expect(findOptionByValue(options, "location")).toBeDefined();
  expect(findOptionByValue(options, "location.city")).toBeUndefined();
});

it("respects excluded field types for parent and component choices", () => {
  act(() => root.render(<Harness mapping excluded={["location"]} />));
  expect(findOptionByValue(options, "location")).toBeUndefined();
  expect(findOptionByValue(options, "location.countryCode")).toBeUndefined();
});
