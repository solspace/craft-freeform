import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LimitedUsersDetail } from "./limited-users.detail";
import {
  permissionFixture,
  readPermissions,
} from "./limited-users.presets.test-fixtures";
import type { DetailResponse, Item } from "./limited-users.types";

const query = vi.hoisted(() => ({
  data: null as DetailResponse | null,
  pending: false,
  mutate: vi.fn(),
  navigate: vi.fn(),
}));
vi.mock("./limited-users.queries", () => ({
  useLimitedUsersSingleQuery: () => ({ data: query.data, isFetching: false }),
  useLimitedUsersMutation: () => ({
    mutate: query.mutate,
    isPending: query.pending,
  }),
}));
vi.mock("react-router-dom", () => ({
  useParams: () => ({ id: "7" }),
  useNavigate: () => query.navigate,
}));
vi.mock("@config/freeform/freeform.config", () => ({
  default: { metadata: { craft: { is5: true, is: { atLeast: () => true } } } },
}));
vi.mock("@ff-client/hooks/use-save-shortcut", () => ({
  useSaveShortcut: () => undefined,
}));
vi.mock("@ff-client/hooks/use-sidebar-select", () => ({
  useSidebarSelect: () => undefined,
}));
vi.mock("@ff-client/utils/notifications", () => ({
  notifications: { success: vi.fn() },
}));
vi.mock("../settings/settings.sidebar", () => ({
  SettingsSidebar: () => null,
}));
vi.mock("@components/breadcrumbs/breadcrumbs", () => ({
  Breadcrumb: () => null,
}));
vi.mock("@components/layout/blocks/header-container", () => ({
  HeaderContainer: ({
    children,
    extra,
  }: {
    children: React.ReactNode;
    extra: React.ReactNode;
  }) => (
    <header>
      {children}
      {extra}
    </header>
  ),
}));
vi.mock("@components/form-controls/control-types/string/string", () => ({
  default: ({
    property,
    value,
    updateValue,
  }: {
    property: { label: string };
    value: string;
    updateValue: (value: string) => void;
  }) => (
    <input
      aria-label={property.label}
      value={value}
      onChange={(event) => updateValue(event.target.value)}
    />
  ),
}));
vi.mock("@components/form-controls/control-types/textarea/textarea", () => ({
  default: ({
    property,
    value,
    updateValue,
  }: {
    property: { label: string };
    value: string;
    updateValue: (value: string) => void;
  }) => (
    <textarea
      aria-label={property.label}
      value={value}
      onChange={(event) => updateValue(event.target.value)}
    />
  ),
}));

let host: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  query.data = {
    id: 7,
    name: "Editorial team",
    description: "Existing description",
    items: permissionFixture(),
  };
  const fieldTypes = query.data.items[0].children?.find(
    ({ id }) => id === "fieldTypes",
  );
  if (fieldTypes?.type === "toggles") {
    const value =
      "Solspace\\Freeform\\Fields\\Implementations\\Pro\\DatetimeField";
    fieldTypes.values = [...fieldTypes.values, value];
    fieldTypes.options = [
      ...fieldTypes.options,
      { value, label: "Date & Time" },
    ];
  }
  query.pending = false;
  query.mutate.mockReset();
  query.navigate.mockReset();
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

const render = async () => {
  await act(async () => root.render(<LimitedUsersDetail />));
};
const button = (label: string) =>
  Array.from(host.querySelectorAll<HTMLButtonElement>("button")).find(
    (element) =>
      element.querySelector("strong")?.textContent === label ||
      (label === "Save" && element.classList.contains("submit")) ||
      element.textContent === label,
  );
const click = async (label: string) => {
  await act(async () => button(label)!.click());
};

describe("limited-user preset editor", () => {
  it("applies a preset to the draft without saving or changing the profile identity, then sends those permissions on Save", async () => {
    await render();
    await click("Content Editor");
    expect(query.mutate).not.toHaveBeenCalled();
    expect(
      host.querySelector<HTMLInputElement>("#limited-user-name")?.value,
    ).toBe("Editorial team");
    expect(
      host.querySelector<HTMLTextAreaElement>("#limited-user-description")
        ?.value,
    ).toBe("Existing description");
    expect(button("Content Editor")?.getAttribute("aria-pressed")).toBe("true");
    expect(host.querySelector('[role="status"]')?.textContent).toContain(
      "Content Editor applied",
    );
    await click("Save");
    expect(query.mutate).toHaveBeenCalledOnce();
    const payload = query.mutate.mock.calls[0][0] as {
      name: string;
      description: string;
      items: Item[];
    };
    expect(payload.name).toBe("Editorial team");
    expect(payload.description).toBe("Existing description");
    expect(readPermissions(payload.items)).toMatchObject({
      "layout.fieldTypes": [],
      "integrations.tab": false,
      "settings.tab": false,
      "preview.tab": true,
    });
    // A pending/failed save must keep the ability to undo the preset.
    expect(button("Undo preset")).toBeDefined();
    await act(async () => query.mutate.mock.calls[0][1].onSuccess());
    expect(button("Undo preset")).toBeUndefined();
  });

  it("undo restores the exact prior draft, including manual edits, and clears a stale preset highlight", async () => {
    await render();
    const firstOption = () =>
      host.querySelector<HTMLButtonElement>(
        'li[data-id="date"] input[type="checkbox"]',
      )!;
    await act(async () => firstOption().click());
    expect(String((firstOption() as unknown as HTMLInputElement).checked)).toBe(
      "false",
    );
    await click("Content Editor");
    expect(host.querySelector('li[data-id="props"]')).toBeNull();
    await click("Undo preset");
    expect(String((firstOption() as unknown as HTMLInputElement).checked)).toBe(
      "false",
    );
    await click("Simplified Building");
    expect(button("Simplified Building")?.getAttribute("aria-pressed")).toBe(
      "true",
    );
    await act(async () => firstOption().click());
    expect(button("Simplified Building")?.getAttribute("aria-pressed")).toBe(
      "false",
    );
    await click("Save");
    expect(
      readPermissions(query.mutate.mock.calls[0][0].items)["props.date"],
    ).not.toContain("initialValue");
  });

  it("undo after trying several presets restores the immediately previous configuration", async () => {
    await render();
    await click("Simplified Building");
    await click("Advanced Building");
    await click("Undo preset");
    expect(button("Simplified Building")?.getAttribute("aria-pressed")).toBe(
      "true",
    );
    expect(button("Undo preset")).toBeUndefined();
    expect(query.mutate).not.toHaveBeenCalled();
  });

  it("collapses field-specific properties when their field type is disabled and restores the unchanged options when re-enabled", async () => {
    await render();
    const dateType = Array.from(
      host.querySelectorAll<HTMLInputElement>(
        'li[data-id="fieldTypes"] input[type="checkbox"]',
      ),
    ).find((input) => input.closest("label")?.textContent === "Date & Time")!;
    const dateGroup = () =>
      host.querySelector('li[data-id="props"] li[data-id="date"]')!;
    const collapse = () =>
      dateGroup().querySelector<HTMLDivElement>(":scope > div[aria-hidden]")!;
    const firstOption = () =>
      dateGroup().querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    await act(async () => firstOption().click());
    await act(async () => dateType.click());
    expect(dateType.checked).toBe(false);
    expect(collapse().getAttribute("aria-hidden")).toBe("true");
    expect(collapse().hasAttribute("inert")).toBe(true);
    await click("Save");
    expect(
      readPermissions(query.mutate.mock.calls[0][0].items)["props.date"],
    ).toEqual(["picker", "minuteStep", "futureProperty"]);
    await act(async () => dateType.click());
    expect(collapse().getAttribute("aria-hidden")).toBe("false");
    expect(collapse().hasAttribute("inert")).toBe(false);
    expect(String((firstOption() as unknown as HTMLInputElement).checked)).toBe(
      "false",
    );
    await click("Content Editor");
    expect(host.querySelector('li[data-id="props"]')).toBeNull();
    await click("Undo preset");
    expect(
      host
        .querySelector('li[data-id="props"] li[data-id="html"]')
        ?.hasAttribute("data-collapsed"),
    ).toBe(false);
  });

  it("hides the whole field-properties section when no corresponding types are enabled without clearing its stored permissions", async () => {
    await render();
    const types = host.querySelector('li[data-id="fieldTypes"]')!;
    const bulk = (label: string) =>
      Array.from(types.querySelectorAll<HTMLButtonElement>("button")).find(
        (button) => button.textContent === label,
      )!;
    await act(async () => bulk("Disable All").click());
    expect(host.querySelector('li[data-id="props"]')).toBeNull();
    await click("Save");
    expect(
      readPermissions(query.mutate.mock.calls[0][0].items)["props.date"],
    ).toEqual(["initialValue", "picker", "minuteStep", "futureProperty"]);
    await act(async () => bulk("Enable All").click());
    expect(
      host.querySelector(
        'li[data-id="props"] li[data-id="date"] [aria-hidden="false"]',
      ),
    ).not.toBeNull();
  });

  it("collapses disabled parent permissions and preserves their selected child options when reopened", async () => {
    await render();
    const parent = host.querySelector<HTMLLIElement>(
      'li[data-id="predefined"]',
    )!;
    const collapse = parent.querySelector<HTMLDivElement>(
      ":scope > div[aria-hidden]",
    )!;
    const children = collapse.querySelector<HTMLUListElement>("ul")!;
    const option = children.querySelector<HTMLInputElement>(
      'input[type="checkbox"]',
    )!;
    await act(async () => option.click());
    expect(option.checked).toBe(false);
    const label = parent.querySelector<HTMLLabelElement>(":scope > div label")!;
    await act(async () => label.click());
    expect(collapse.getAttribute("aria-hidden")).toBe("true");
    expect(collapse.hasAttribute("inert")).toBe(true);
    await click("Save");
    expect(readPermissions(query.mutate.mock.calls[0][0].items)).toMatchObject({
      "layout.options.predefined": false,
      "layout.options.predefined.types": ["Languages"],
    });
    await act(async () => label.click());
    expect(collapse.getAttribute("aria-hidden")).toBe("false");
    expect(collapse.hasAttribute("inert")).toBe(false);
    expect(option.checked).toBe(false);
    expect(children.querySelectorAll("input:checked")).toHaveLength(1);
  });

  it("disables preset changes during a save and resets undo when another profile is loaded", async () => {
    await render();
    await click("Content Editor");
    query.pending = true;
    await render();
    for (const label of [
      "Content Editor",
      "Simplified Building",
      "Advanced Building",
      "Full Access",
      "Undo preset",
    ]) {
      expect(button(label)?.disabled).toBe(true);
    }
    query.pending = false;
    query.data = {
      ...query.data!,
      id: 8,
      name: "Another profile",
      items: permissionFixture(),
    };
    await render();
    expect(button("Undo preset")).toBeUndefined();
    expect(
      host.querySelector<HTMLInputElement>("#limited-user-name")?.value,
    ).toBe("Another profile");
    expect(button("Content Editor")?.getAttribute("aria-pressed")).toBe(
      "false",
    );
    expect(button("Full Access")?.getAttribute("aria-pressed")).toBe("true");
  });
});
