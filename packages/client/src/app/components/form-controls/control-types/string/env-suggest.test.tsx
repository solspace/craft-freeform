import { PropertyType, type StringProperty } from "@ff-client/types/properties";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { EnvSuggestInput } from "./env-suggest";

vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));
vi.mock("@ff-client/queries/autosuggest", () => ({
  useAutosuggestEnvVariables: () => ({
    data: [
      {
        label: "Environment Variables",
        data: [{ name: "$GTM_ID", hint: "GTM-TEST" }],
      },
    ],
  }),
}));

it("preserves custom text, cleared values, and unavailable environment references", async () => {
  if (!customElements.get("craft-combobox")) {
    customElements.define(
      "craft-combobox",
      class extends HTMLElement {
        value = "";
        options: unknown[] = [];
        requireOptionMatch = true;
        showAllOnEmpty = false;
      },
    );
  }
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const update = vi.fn();
  const property: StringProperty = {
    type: PropertyType.String,
    handle: "containerId",
    label: "Container ID",
  };
  const render = async (value: string, flags: StringProperty["flags"] = []) => {
    await act(() =>
      root.render(
        <EnvSuggestInput
          value={value}
          property={{ ...property, flags }}
          updateValue={update}
        />,
      ),
    );
  };
  try {
    await render("$ONLY_ON_PRODUCTION");
    const combobox = container.querySelector(
      "craft-combobox",
    ) as HTMLElement & {
      value: string;
      options: unknown[];
      requireOptionMatch: boolean;
      showAllOnEmpty: boolean;
    };
    expect(combobox.value).toBe("$ONLY_ON_PRODUCTION");
    expect(combobox.requireOptionMatch).toBe(false);
    expect(combobox.showAllOnEmpty).toBe(true);
    expect(combobox.options).toEqual([
      {
        type: "optgroup",
        label: "Environment Variables",
        options: [
          { value: "$GTM_ID", label: "$GTM_ID", data: { hint: "GTM-TEST" } },
        ],
      },
    ]);
    expect(update).not.toHaveBeenCalled();
    for (const value of ["GTM-CUSTOM", "", "$GTM_ID"]) {
      combobox.value = value;
      await act(() => combobox.dispatchEvent(new Event("input")));
      expect(update).toHaveBeenLastCalledWith(value);
      await render(value);
      expect(combobox.value).toBe(value);
    }
    update.mockClear();
    await act(() =>
      combobox.dispatchEvent(
        new CustomEvent("input", { detail: { initialize: true } }),
      ),
    );
    expect(update).not.toHaveBeenCalled();
    await render("GTM-READONLY", ["readonly"]);
    combobox.value = "changed";
    await act(() => combobox.dispatchEvent(new Event("input")));
    expect(update).not.toHaveBeenCalled();
  } finally {
    await act(() => root.unmount());
    container.remove();
  }
});
