import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  document.body.replaceChildren();
  vi.resetModules();
});

it.each(["fragment", "legacy"])(
  "reads configuration from the %s control panel layout",
  async (layout) => {
    const configuration = {
      templates: { method: "form" },
      metadata: { craft: { version: "6.0.0-beta.1" } },
      editions: { edition: "pro", tiers: ["lite", "pro"] },
      limitations: { items: { "settings.tab.general": false } },
    };
    const element = document.createElement(
      layout === "fragment" ? "div" : "script",
    );
    element.id = "freeform-config";
    if (layout === "fragment") {
      element.setAttribute("data-config", JSON.stringify(configuration));
    } else {
      element.setAttribute("type", "application/json");
      element.textContent = JSON.stringify(configuration);
    }
    document.body.append(element);

    const { default: config, Edition } = await import(
      "../../config/freeform/freeform.config"
    );
    expect(config.templates.method).toBe("form");
    expect(config.metadata.craft.version).toBe("6.0.0-beta.1");
    expect(config.editions.is(Edition.Pro)).toBe(true);
    expect(config.limitations.can("settings.tab.general.name")).toBe(false);
  },
);
