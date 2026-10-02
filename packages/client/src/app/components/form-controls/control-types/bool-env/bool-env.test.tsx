import type { BooleanEnvProperty } from "@ff-client/types/properties";
import { PropertyType } from "@ff-client/types/properties";
import { act, type PropsWithChildren } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import BoolEnv from "./bool-env";
import { parseEnvBoolean } from "./bool-env.operations";

vi.mock("@components/form-controls/control", () => ({
  Control: ({ children }: PropsWithChildren) => <div>{children}</div>,
}));
vi.mock("@ff-client/hooks/use-codeblock-text", () => ({
  useCodeblockText: (value: string) => value,
}));
vi.mock("@ff-client/queries/autosuggest", () => ({
  useAutosuggestEnvVariables: () => ({
    isFetching: false,
    data: [
      {
        label: "Environment Variables",
        data: [
          { name: "$ON", hint: "true" },
          { name: "$OFF", hint: "false" },
          { name: "$TEXT", hint: "not a boolean" },
        ],
      },
    ],
  }),
}));

it("uses a native combobox and keeps the selected status on React settings", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const update = vi.fn();
  const property: BooleanEnvProperty = {
    type: PropertyType.BooleanEnv,
    handle: "enabled",
    label: "Feature",
  };
  try {
    await act(() =>
      root.render(
        <BoolEnv property={property} value="1" updateValue={update} />,
      ),
    );
    const combobox = container.querySelector(
      "craft-combobox",
    ) as HTMLElement & { modelValue: string };
    expect(combobox.getAttribute("model-value")).toBe("true");
    const options = JSON.parse(combobox.getAttribute("options")!);
    expect(
      options.slice(0, 2).map((option: { label: string }) => option.label),
    ).toEqual(["Enabled", "Disabled"]);
    expect(
      options[2].options.map((option: { value: string }) => option.value),
    ).toEqual(["$ON", "$OFF"]);
    expect(options[2].options[1].data.hint).toBe("Disabled");
    expect(
      container.querySelector("craft-indicator")!.getAttribute("variant"),
    ).toBe("success");
    combobox.modelValue = "$OFF";
    await act(async () => {
      combobox.dispatchEvent(new CustomEvent("model-value-changed"));
      await Promise.resolve();
    });
    expect(update).toHaveBeenCalledExactlyOnceWith("$OFF");
    await act(() =>
      root.render(
        <BoolEnv property={property} value="$OFF" updateValue={update} />,
      ),
    );
    expect(
      container.querySelector("craft-indicator")!.getAttribute("variant"),
    ).toBe("empty");
    await act(() =>
      root.render(
        <BoolEnv
          property={{ ...property, disabled: true }}
          value="$OFF"
          updateValue={update}
        />,
      ),
    );
    expect(combobox.hasAttribute("disabled")).toBe(true);
  } finally {
    await act(() => root.unmount());
    container.remove();
  }
});

it("recognizes boolean env values without treating the word false as enabled", () => {
  for (const value of ["true", "1", "yes", "on"])
    expect(parseEnvBoolean(value)).toBe(true);
  for (const value of ["false", "0", "no", "off"])
    expect(parseEnvBoolean(value)).toBe(false);
  expect(parseEnvBoolean("text")).toBeNull();
  expect(parseEnvBoolean(undefined)).toBeNull();
});
