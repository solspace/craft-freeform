import { expect, it, vi } from "vitest";
import { createApp, h, nextTick, reactive } from "vue";
import { LocationFieldRenderer } from "./LocationField.js";

it.each(["search", "selected"])(
  "retains values and respects %s visibility during validation",
  async (addressDisplay) => {
    const props = reactive({
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
      errors: [] as string[],
      input: { id: "address", required: true, "aria-invalid": false },
      classNames: {},
      form: { setValue: vi.fn(), resetVersion: 0 },
    });
    const host = document.createElement("div");
    document.body.append(host);
    const app = createApp({
      render: () => h("form", {}, h(LocationFieldRenderer, props)),
    });
    app.mount(host);
    try {
      const group = host.querySelector<HTMLElement>(
        "[data-freeform-location-components]",
      )!;
      expect(group.hidden).toBe(addressDisplay === "search");
      expect(
        new FormData(host.querySelector("form")!).get("address[city]"),
      ).toBe("Winnipeg");
      props.value.city = "";
      await nextTick();
      expect(group.hidden).toBe(true);
      props.errors = ["City required"];
      props.input["aria-invalid"] = true;
      await nextTick();
      expect(group.hidden).toBe(addressDisplay === "search");
      expect(
        host
          .querySelector('[name="address[search]"]')
          ?.getAttribute("aria-invalid"),
      ).toBe(addressDisplay === "search" ? "true" : null);
      expect(
        group.querySelector<HTMLInputElement>(
          '[data-location-component="city"]',
        )!.required,
      ).toBe(addressDisplay !== "search");
    } finally {
      app.unmount();
      host.remove();
    }
  },
);

it("marks only missing required components and clears their visual errors after correction", async () => {
  const props = reactive({
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
    value: { line1: "123 Main", city: "" },
    errors: ["City required"],
    classNames: { input: "input input-error", inputError: "input-error" },
    form: { setValue: vi.fn(), resetVersion: 0 },
  });
  const host = document.createElement("div");
  document.body.append(host);
  const app = createApp({ render: () => h(LocationFieldRenderer, props) });
  app.mount(host);
  try {
    const city = host.querySelector<HTMLInputElement>(
      "[data-location-component=city]",
    )!;
    expect(host.querySelectorAll("[aria-invalid=true]")).toHaveLength(1);
    expect(city.className).toBe("input input-error");
    expect(city.getAttribute("aria-describedby")).toBe("address-errors");
    expect(city.required).toBe(true);
    expect(
      host.querySelector<HTMLInputElement>("[role=combobox]")!.required,
    ).toBe(false);
    expect(
      host.querySelector<HTMLInputElement>("[data-location-component=line2]")!
        .required,
    ).toBe(false);
    props.value.city = "Winnipeg";
    props.errors = [];
    props.input["aria-invalid"] = false;
    props.classNames.input = "input";
    await nextTick();
    expect(host.querySelectorAll("[aria-invalid=true]")).toHaveLength(0);
    expect(city.className).toBe("input");
  } finally {
    app.unmount();
    host.remove();
  }
});

it("preserves structured manual values, follows resets, and cleans up on unmount", async () => {
  const props = reactive({
    field: {
      uid: "address",
      handle: "address",
      type: "location",
      frontend: { config: { components: ["city"], labels: { city: "City" } } },
    },
    input: { id: "address", name: "address" },
    value: { search: "123 Main", city: "Winnipeg" },
    classNames: {},
    form: {
      setValue: (_handle: string, value: { search: string; city: string }) => {
        props.value = value;
      },
      resetVersion: 0,
    },
  });
  const host = document.createElement("div");
  document.body.append(host);
  const app = createApp({ render: () => h(LocationFieldRenderer, props) });
  app.mount(host);
  try {
    const search = host.querySelector<HTMLInputElement>(
      'input[name="address[search]"]',
    )!;
    const city = host.querySelector<HTMLInputElement>(
      '[data-location-component="city"]',
    )!;
    expect(search.type).toBe("hidden");
    expect(search.value).toBe("");
    expect(host.querySelector('[role="combobox"]')).toBeNull();
    expect(city.value).toBe("Winnipeg");
    city.value = "Toronto";
    city.dispatchEvent(new Event("input", { bubbles: true }));
    await nextTick();
    expect(props.value.city).toBe("Toronto");
    expect(city.value).toBe("Toronto");
    props.value = { search: "", city: "" };
    props.form.resetVersion++;
    await nextTick();
    expect(city.value).toBe("");
    expect(search.value).toBe("");
    app.unmount();
    expect(host.querySelector('[role="listbox"]')).toBeNull();
  } finally {
    host.remove();
  }
});

it.each([
  [{ apiKey: "test", components: ["city"] }, true],
  [{ showSearch: true, components: ["city"] }, true],
  [{ mode: "mapped" }, true],
  [{ components: ["city"] }, false],
])(
  "shows the search only for configured or mapped fields (%j)",
  async (config, visible) => {
    const host = document.createElement("div");
    document.body.append(host);
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
    };
    const app = createApp({ render: () => h(LocationFieldRenderer, props) });
    app.mount(host);
    try {
      await nextTick();
      expect(!!host.querySelector('[role="combobox"]')).toBe(visible);
      expect(
        host.querySelector<HTMLInputElement>('input[name="address[search]"]')!
          .required,
      ).toBe(visible);
    } finally {
      app.unmount();
      host.remove();
    }
  },
);
