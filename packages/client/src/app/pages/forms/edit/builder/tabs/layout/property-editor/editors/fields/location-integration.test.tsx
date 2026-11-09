import type { DropdownProps } from "@components/elements/custom-dropdown/dropdown";
import type { Integration } from "@ff-client/types/integrations";
import {
  type AppStateSelectProperty,
  PropertyType,
} from "@ff-client/types/properties";
import { configureStore } from "@reduxjs/toolkit";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Provider } from "react-redux";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import {
  LocationIntegration,
  LocationRequiredComponents,
} from "./location-integration";

vi.mock("@config/freeform/freeform.config", () => ({
  Edition: { Express: "express" },
  default: { editions: { isAtLeast: () => true } },
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
  translate: (text: string) => text,
}));
vi.mock("@editor/store/slices/translations/translations.hooks", () => ({
  useTranslations: () => ({ hasTranslation: () => false }),
}));
vi.mock("@components/elements/custom-dropdown/dropdown", () => ({
  Dropdown: ({ options, emptyOption, value, onChange }: DropdownProps) => (
    <select
      value={value || ""}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">{emptyOption}</option>
      {options.map(
        (option) =>
          "value" in option && (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ),
      )}
    </select>
  ),
}));

const property: AppStateSelectProperty = {
  type: PropertyType.AppStateSelect,
  handle: "integration",
  label: "Google Places Integration",
  instructions: "Select an integration or use manual entry.",
  emptyOption: "Manual entry only",
  source: "integrations",
  optionValue: "uid",
  optionLabel: "name",
  filters: ["Boolean(enabled)", 'shortName === "GooglePlaces"'],
};
const integration = (
  uid: string,
  enabled: boolean,
  shortName = "GooglePlaces",
) => ({ uid, enabled, shortName, name: uid }) as Integration;

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

it("offers required components only for included address inputs and preserves updates", () => {
  const updateValue = vi.fn();
  act(() =>
    root.render(
      <LocationRequiredComponents
        value={[]}
        property={{
          type: PropertyType.Checkboxes,
          handle: "requiredComponents",
          options: [
            { value: "line1", label: "Address Line 1" },
            { value: "city", label: "City" },
            { value: "country", label: "Country" },
          ],
        }}
        context={{ properties: { includedComponents: ["line1", "city"] } }}
        updateValue={updateValue}
      />,
    ),
  );
  expect(host.querySelectorAll("input[type=checkbox]")).toHaveLength(2);
  expect(host.textContent).not.toContain("Country");
  act(() => host.querySelector<HTMLInputElement>("input")!.click());
  expect(updateValue).toHaveBeenCalledWith(["line1"]);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

function render(integrations: Integration[]) {
  const store = configureStore({
    reducer: (state = { integrations }, action) =>
      action.type === "replace"
        ? { integrations: action.payload as Integration[] }
        : state,
  });
  const updateValue = vi.fn();
  act(() =>
    root.render(
      <Provider store={store}>
        <LocationIntegration
          value=""
          property={property}
          updateValue={updateValue}
        />
      </Provider>,
    ),
  );
  return { store, updateValue };
}

it("shows an enable hint for configured Google Places and updates when form integration settings change", () => {
  const { store, updateValue } = render([integration("Places", false)]);
  expect(host.textContent).toContain("Enable it in the Integrations tab");
  expect(host.querySelectorAll("option")).toHaveLength(1);
  expect(host.querySelector("select")?.textContent).toBe("Manual entry only");

  act(() =>
    store.dispatch({ type: "replace", payload: [integration("Places", true)] }),
  );
  expect(host.textContent).not.toContain("not enabled for this form");
  expect(host.textContent).toContain(property.instructions);
  expect(host.querySelectorAll("option")).toHaveLength(2);
  const select = host.querySelector("select")!;
  act(() => {
    select.value = "Places";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  expect(updateValue).toHaveBeenCalledWith("Places");

  act(() =>
    store.dispatch({
      type: "replace",
      payload: [integration("Places", false)],
    }),
  );
  expect(host.textContent).toContain("not enabled for this form");
  expect(host.querySelectorAll("option")).toHaveLength(1);
});

it.each([
  [],
  [integration("Other", false, "Other")],
  [integration("Other", true, "Other")],
  [integration("Disabled Places", false), integration("Enabled Places", true)],
])(
  "avoids an enable hint when Google Places is absent or already enabled (%j)",
  (...items) => {
    render(items as Integration[]);
    expect(host.textContent).not.toContain("not enabled for this form");
    expect(host.textContent).toContain(property.instructions);
  },
);
