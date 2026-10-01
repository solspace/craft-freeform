import type { Property } from "@ff-client/types/properties";
import { PropertyType } from "@ff-client/types/properties";
import axios from "axios";
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Integration } from "../integration.types";

import { ModelInput } from "./editor.model-input";

vi.mock("axios", () => ({ default: { post: vi.fn() } }));
vi.mock("@ff-client/utils/translations", () => ({
  default: (value: string) => value,
}));
vi.mock("@components/form-controls/control", () => ({
  Control: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));
vi.mock("@components/form-controls/control-types/string/string", () => ({
  default: ({
    value,
    updateValue,
  }: {
    value: string;
    updateValue: (value: string) => void;
  }) => (
    <input
      aria-label="Custom model ID"
      value={value}
      onChange={(event) => updateValue(event.target.value)}
    />
  ),
}));
vi.mock("@components/elements/custom-dropdown/dropdown", () => ({
  Dropdown: ({
    value,
    options,
    onChange,
  }: {
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
  }) => (
    <select
      aria-label="Model"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

const property: Property = {
  handle: "model",
  type: PropertyType.String,
  value: "gpt-5.6-luna",
};

let root: Root;
let container: HTMLDivElement;

const mount = (
  id: number | undefined,
  model: string,
  onUpdate = vi.fn(),
  provider = "OpenAI",
) => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  const modelProperty =
    provider === "Gemini"
      ? { ...property, value: "gemini-3.5-flash-lite" }
      : property;

  const integration = {
    id,
    type: { name: provider },
    properties: [modelProperty, { handle: "apiKey", value: "test-key" }],
  } as Integration;

  const TestEditor = () => {
    const [metadata, setMetadata] = useState({ model, apiKey: "test-key" });
    return (
      <ModelInput
        integration={integration}
        property={modelProperty}
        values={{ name: "OpenAI", handle: "openAi", metadata }}
        onUpdate={(key, value) => {
          setMetadata((previous) => ({ ...previous, [key]: value }));
          onUpdate(key, value);
        }}
      />
    );
  };

  act(() => root.render(<TestEditor />));
  return onUpdate;
};

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  vi.useRealTimers();
  vi.mocked(axios.post).mockReset();
});

describe("AI model picker", () => {
  it("preserves an existing model absent from the provider's list as Other", async () => {
    vi.useFakeTimers();
    vi.mocked(axios.post).mockResolvedValue({
      data: {
        models: [{ id: "gpt-6-luna", label: "gpt-6-luna" }],
        available: true,
      },
    });
    const onUpdate = mount(12, "custom-gpt-model");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(
      container.querySelector<HTMLSelectElement>('select[aria-label="Model"]')
        ?.value,
    ).toBe("__freeform_custom_model__");
    expect(
      container.querySelector<HTMLInputElement>(
        'input[aria-label="Custom model ID"]',
      )?.value,
    ).toBe("custom-gpt-model");
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("selects an available economical model for a new integration when its default is unavailable", async () => {
    vi.useFakeTimers();
    vi.mocked(axios.post).mockResolvedValue({
      data: {
        models: [{ id: "gpt-6-luna", label: "gpt-6-luna" }],
        available: true,
      },
    });
    const onUpdate = mount(undefined, "gpt-5.6-luna");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(onUpdate).toHaveBeenCalledWith("model", "gpt-6-luna");
    expect(
      container.querySelector<HTMLSelectElement>('select[aria-label="Model"]')
        ?.value,
    ).toBe("gpt-6-luna");
  });

  it("prefers a provider verified latest alias for a new Gemini integration", async () => {
    vi.useFakeTimers();
    vi.mocked(axios.post).mockResolvedValue({
      data: {
        models: [
          { id: "gemini-3.5-flash-lite", label: "Gemini Flash Lite" },
          {
            id: "gemini-flash-lite-latest",
            label: "gemini-flash-lite-latest (latest alias)",
          },
        ],
        available: true,
      },
    });
    const onUpdate = mount(
      undefined,
      "gemini-3.5-flash-lite",
      vi.fn(),
      "Gemini",
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(onUpdate).toHaveBeenCalledWith("model", "gemini-flash-lite-latest");
  });

  it("lets an editor choose Other and save a model absent from the list", async () => {
    vi.useFakeTimers();
    vi.mocked(axios.post).mockResolvedValue({
      data: {
        models: [{ id: "gpt-5.6-luna", label: "gpt-5.6-luna" }],
        available: true,
      },
    });
    const onUpdate = mount(12, "gpt-5.6-luna");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    await act(async () => {
      const select = container.querySelector<HTMLSelectElement>(
        'select[aria-label="Model"]',
      )!;
      select.value = "__freeform_custom_model__";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await act(async () => {
      const input = container.querySelector<HTMLInputElement>(
        'input[aria-label="Custom model ID"]',
      )!;
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!;
      setter.call(input, "my-custom-model");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

    expect(onUpdate).toHaveBeenCalledWith("model", "my-custom-model");
  });
});
