import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ConfigurationStatusChips } from "./settings.usage.status-chips";

vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));
let root: Root;
let container: HTMLDivElement;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

it("reveals disabled notifications after enabled ones without expanding integrations", () => {
  act(() =>
    root.render(
      <>
        <ConfigurationStatusChips
          id="notifications"
          label="Notifications"
          items={[
            {
              key: "n1",
              name: "Disabled notification",
              enabled: false,
              type: "Conditional",
            },
            {
              key: "n2",
              name: "Admin notification",
              enabled: true,
              type: "Admin",
            },
          ]}
        />
        <ConfigurationStatusChips
          id="integrations"
          label="Integrations"
          items={[
            { key: "i1", name: "Disabled integration", enabled: false },
            { key: "i2", name: "Honeypot", enabled: true },
          ]}
        />
      </>,
    ),
  );
  const notifications = container.querySelector("#notifications")!;
  const integrations = container.querySelector("#integrations")!;
  const toggle = notifications.querySelector("button")!;
  const names = () =>
    Array.from(
      notifications.querySelectorAll(".configuration-status-chip"),
    ).map(
      (chip) => chip.querySelector(".configuration-status-name")!.textContent,
    );
  expect(names()).toEqual(["Admin notification"]);
  expect(toggle.textContent).toBe("Show disabled");
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  act(() => toggle.click());
  expect(names()).toEqual(["Admin notification", "Disabled notification"]);
  expect(
    Array.from(
      notifications.querySelectorAll(".configuration-status-type"),
    ).map((type) => type.textContent),
  ).toEqual(["Admin", "Conditional"]);
  expect(toggle.textContent).toBe("Hide disabled");
  expect(toggle.getAttribute("aria-expanded")).toBe("true");
  expect(
    notifications.querySelector('[title="Disabled"] .status.disabled'),
  ).not.toBeNull();
  expect(
    integrations.querySelector("button")!.getAttribute("aria-expanded"),
  ).toBe("false");
  expect(
    integrations.querySelectorAll(".configuration-status-chip"),
  ).toHaveLength(1);
  act(() => toggle.click());
  expect(names()).toEqual(["Admin notification"]);
});

it("handles an empty list and a list with only disabled notifications", () => {
  act(() =>
    root.render(
      <>
        <ConfigurationStatusChips id="empty" label="Integrations" items={[]} />
        <ConfigurationStatusChips
          id="notifications"
          label="Notifications"
          items={[{ key: "n1", name: "Customer confirmation", enabled: false }]}
        />
      </>,
    ),
  );
  expect(container.querySelector("#empty button")).toBeNull();
  const notifications = container.querySelector("#notifications")!;
  expect(
    notifications.querySelector(".configuration-status-list")!.textContent,
  ).toBe("None");
  act(() => notifications.querySelector("button")!.click());
  expect(
    notifications.querySelector(".configuration-status-chip")!.textContent,
  ).toBe("Customer confirmation");
});
