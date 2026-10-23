import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { afterEach, expect, it, vi } from "vitest";
import type { ReactFieldRendererProps } from "../../types.js";
import { LocationFieldRenderer } from "./LocationField.js";

afterEach(cleanup);
it.each(["search", "selected"])(
  "retains hidden values and respects %s visibility during validation",
  (addressDisplay) => {
    const props = {
      field: {
        handle: "address",
        frontend: {
          config: {
            apiKey: "test",
            addressDisplay,
            components: ["city"],
            requiredComponents: ["city"],
          },
        },
      },
      value: { city: "Winnipeg" },
      errors: [],
      input: { id: "address", required: true, "aria-invalid": false },
      classNames: {},
      form: { setValue: vi.fn(), resetVersion: 0 },
    } as unknown as ReactFieldRendererProps;
    const view = render(
      <form>
        <LocationFieldRenderer {...props} />
      </form>,
    );
    const group = view.container.querySelector<HTMLElement>(
      "[data-freeform-location-components]",
    )!;
    expect(group.hidden).toBe(addressDisplay === "search");
    expect(
      new FormData(view.container.querySelector("form")!).get("address[city]"),
    ).toBe("Winnipeg");
    view.rerender(
      <form>
        <LocationFieldRenderer {...props} value={{ city: "" }} />
      </form>,
    );
    expect(group.hidden).toBe(true);
    view.rerender(
      <form>
        <LocationFieldRenderer
          {...props}
          value={{ city: "" }}
          errors={["City required"]}
          input={{ ...props.input, "aria-invalid": true }}
        />
      </form>,
    );
    expect(group.hidden).toBe(addressDisplay === "search");
    expect(
      view.container
        .querySelector('[name="address[search]"]')
        ?.getAttribute("aria-invalid"),
    ).toBe(addressDisplay === "search" ? "true" : null);
    expect(
      group.querySelector<HTMLInputElement>('[data-location-component="city"]')!
        .required,
    ).toBe(addressDisplay !== "search");
  },
);
it("marks only missing required components and retains the address-level default", () => {
  const props = {
    field: {
      handle: "address",
      frontend: {
        config: {
          showSearch: true,
          components: ["line1", "line2", "city"],
          requiredComponents: ["line1", "city"],
        },
      },
    },
    input: {
      id: "address",
      required: true,
      "aria-invalid": true,
      "aria-describedby": "address-errors",
    },
    value: { line1: "123 Main" },
    errors: ["City required"],
    classNames: { input: "input input-error", inputError: "input-error" },
    form: { setValue: vi.fn(), resetVersion: 0 },
  } as unknown as ReactFieldRendererProps;
  const view = render(<LocationFieldRenderer {...props} />);
  const city = view.container.querySelector<HTMLInputElement>(
    "[data-location-component=city]",
  )!;
  expect(view.container.querySelectorAll("[aria-invalid=true]")).toHaveLength(
    1,
  );
  expect(city.getAttribute("aria-invalid")).toBe("true");
  expect(city.className).toBe("input input-error");
  expect(city.getAttribute("aria-describedby")).toBe("address-errors");
  expect(city.required).toBe(true);
  expect(
    view.container.querySelector<HTMLInputElement>("[role=combobox]")!.required,
  ).toBe(false);
  expect(
    view.container.querySelector<HTMLInputElement>(
      "[data-location-component=line2]",
    )!.required,
  ).toBe(false);
  view.rerender(
    <LocationFieldRenderer
      {...props}
      value={{ line1: "123 Main", city: "Winnipeg" }}
      errors={[]}
      input={{ ...props.input, "aria-invalid": false }}
      classNames={{ input: "input", inputError: "input-error" }}
    />,
  );
  expect(view.container.querySelectorAll("[aria-invalid=true]")).toHaveLength(
    0,
  );
  expect(city.className).toBe("input");
});
it("retains manual address components through controlled rerenders and external reset", async () => {
  function Fixture() {
    const [value, setValue] = useState({ search: "", city: "Winnipeg" });
    const props = {
      field: {
        uid: "address",
        handle: "address",
        type: "location",
        frontend: {
          config: { components: ["city"], labels: { city: "City" } },
        },
      },
      input: { id: "address", name: "address" },
      value,
      classNames: {},
      form: {
        setValue: (_handle: string, next: typeof value) => setValue(next),
        resetVersion: 0,
      },
    } as unknown as ReactFieldRendererProps;
    return (
      <>
        <LocationFieldRenderer {...props} />
        <output>{JSON.stringify(value)}</output>
        <button
          type="button"
          onClick={() => setValue({ search: "", city: "" })}
        >
          Reset
        </button>
      </>
    );
  }
  const view = render(<Fixture />);
  const city = view.getByLabelText("City") as HTMLInputElement;
  expect(city.value).toBe("Winnipeg");
  fireEvent.input(city, { target: { value: "Toronto" } });
  const search = view.container.querySelector<HTMLInputElement>(
    'input[name="address[search]"]',
  )!;
  expect(search.type).toBe("hidden");
  expect(view.queryByRole("combobox")).toBeNull();
  expect(view.getAllByRole("textbox")).toEqual([city]);
  expect(view.container.querySelector("output")!.textContent).toContain(
    '"city":"Toronto"',
  );
  expect(city.value).toBe("Toronto");
  fireEvent.click(view.getByText("Reset"));
  expect(city.value).toBe("");
  expect(search.value).toBe("");
});
it("fills other runtime fields using Google Places while respecting disabled targets", async () => {
  vi.useFakeTimers();
  const fetchFields = vi.fn().mockResolvedValue({});
  const suggest = vi.fn().mockResolvedValue({
    suggestions: [
      {
        placePrediction: {
          text: { toString: () => "123 Main" },
          toPlace: () => ({
            fetchFields,
            addressComponents: [{ types: ["locality"], longText: "Winnipeg" }],
          }),
        },
      },
    ],
  });
  const maps = {
    importLibrary: vi.fn().mockResolvedValue({
      AutocompleteSessionToken: class {},
      AutocompleteSuggestion: { fetchAutocompleteSuggestions: suggest },
    }),
  };
  Object.assign(window, { google: { maps } });
  const setValue = vi.fn();
  try {
    const props = {
      field: {
        uid: "address",
        handle: "address",
        type: "location",
        frontend: {
          config: {
            apiKey: "test",
            mode: "mapped",
            mappings: { city: "city", line1: "disabledStreet" },
          },
        },
      },
      input: { id: "address" },
      value: {},
      classNames: {},
      form: {
        setValue,
        isFieldEnabled: (handle: string) => handle !== "disabledStreet",
      },
    } as unknown as ReactFieldRendererProps;
    const view = render(<LocationFieldRenderer {...props} />);
    const search =
      view.container.querySelector<HTMLInputElement>('[role="combobox"]')!;
    search.focus();
    fireEvent.input(search, { target: { value: "123 Main" } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(250);
    });
    await act(async () => {
      fireEvent.click(view.getByRole("option"));
    });
    expect(setValue).toHaveBeenCalledWith("city", "Winnipeg");
    expect(
      setValue.mock.calls.some(([handle]) => handle === "disabledStreet"),
    ).toBe(false);
  } finally {
    delete (window as Window & { google?: unknown }).google;
    vi.useRealTimers();
  }
});

it.each([
  [{ apiKey: "test", components: ["city"] }, true],
  [{ showSearch: true, components: ["city"] }, true],
  [{ mode: "mapped" }, true],
  [{ components: ["city"] }, false],
])(
  "shows the search only for configured or mapped fields (%j)",
  (config, visible) => {
    const props = {
      field: {
        uid: "address",
        handle: "address",
        type: "location",
        frontend: { config },
      },
      input: { id: "address", required: true },
      value: {},
      classNames: {},
      form: { setValue: vi.fn(), resetVersion: 0 },
    } as unknown as ReactFieldRendererProps;
    const view = render(<LocationFieldRenderer {...props} />);
    expect(!!view.queryByRole("combobox")).toBe(visible);
    const search = view.container.querySelector<HTMLInputElement>(
      'input[name="address[search]"]',
    )!;
    expect(search.required).toBe(visible);
  },
);
