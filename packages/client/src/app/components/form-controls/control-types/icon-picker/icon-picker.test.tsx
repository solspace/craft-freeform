import type { IconProperty } from "@ff-client/types/properties";
import { PropertyType } from "@ff-client/types/properties";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import IconPicker from "./icon-picker";

const version = vi.hoisted(() => ({ major: 5 }));
vi.mock("@config/freeform/freeform.config", () => ({
  default: {
    metadata: {
      craft: {
        get is5() {
          return version.major >= 5;
        },
        is: { atLeast: (value: string) => version.major >= Number(value[0]) },
      },
    },
  },
}));
vi.mock("@components/form-controls/control", () => ({
  Control: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));
class LegacyPicker {
  static instances: LegacyPicker[] = [];
  listener = (_event: { iconName: string | null }) => {};
  destroy = vi.fn();
  modal = { destroy: vi.fn() };
  cancelToken = { cancel: vi.fn() };
  selectIcon = vi.fn(async (value: string) =>
    this.listener({ iconName: value }),
  );
  constructor(_element: HTMLElement) {
    LegacyPicker.instances.push(this);
  }
  on(_name: string, listener: typeof this.listener) {
    this.listener = listener;
  }
}
const changed = vi.fn();
let host: HTMLDivElement;
let root: Root;
function draw(value = "", disabled = false) {
  if (!host) {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.stubGlobal("Craft", { IconPicker: LegacyPicker });
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
  }
  const property = {
    handle: "icon",
    type: PropertyType.Icon,
    label: "Form Icon",
    disabled,
  } as IconProperty;
  act(() =>
    root.render(
      <IconPicker property={property} value={value} updateValue={changed} />,
    ),
  );
}
afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  host = undefined;
  version.major = 5;
  LegacyPicker.instances = [];
  changed.mockClear();
  vi.unstubAllGlobals();
});

it("ignores icons completely on Craft 4", () => {
  version.major = 4;
  draw("envelope");
  expect(host.children).toHaveLength(0);
  expect(LegacyPicker.instances).toHaveLength(0);
});
it("preserves saved icons, handles selection/removal, and synchronizes undo without extra changes", () => {
  draw("envelope");
  const picker = LegacyPicker.instances[0];
  expect(picker.selectIcon).toHaveBeenCalledWith("envelope");
  expect(changed).not.toHaveBeenCalled();
  act(() => picker.listener({ iconName: "calendar" }));
  expect(changed).toHaveBeenLastCalledWith("calendar");
  draw("calendar");
  expect(LegacyPicker.instances).toHaveLength(1);
  act(() => picker.listener({ iconName: null }));
  expect(changed).toHaveBeenLastCalledWith("");
  draw("");
  changed.mockClear();
  draw("envelope");
  expect(picker.destroy).toHaveBeenCalledOnce();
  expect(picker.modal.destroy).toHaveBeenCalledOnce();
  expect(LegacyPicker.instances[1].selectIcon).toHaveBeenCalledWith("envelope");
  expect(changed).not.toHaveBeenCalled();
  act(() => picker.listener({ iconName: "old-pending-result" }));
  expect(changed).not.toHaveBeenCalled();
});
it("disables picker actions for read-only settings", () => {
  draw("envelope", true);
  expect(
    Array.from(host.querySelectorAll("button")).every(
      (button) => button.disabled,
    ),
  ).toBe(true);
  act(() => LegacyPicker.instances[0].listener({ iconName: "calendar" }));
  expect(changed).not.toHaveBeenCalled();
});
it("uses Craft 6's native picker and ignores nested input changes", () => {
  version.major = 6;
  draw("envelope");
  const picker = host.querySelector("craft-icon-picker")!;
  expect(picker.getAttribute("value")).toBe("envelope");
  const input = document.createElement("input");
  picker.append(input);
  act(() => input.dispatchEvent(new Event("change", { bubbles: true })));
  expect(changed).not.toHaveBeenCalled();
  act(() =>
    picker.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: "calendar" },
        bubbles: true,
      }),
    ),
  );
  expect(changed).toHaveBeenLastCalledWith("calendar");
  draw("calendar");
  expect(host.querySelector("craft-icon-picker")).toBe(picker);
  draw("envelope");
  expect(host.querySelector("craft-icon-picker")).not.toBe(picker);
  expect(host.querySelector("craft-icon-picker")!.getAttribute("value")).toBe(
    "envelope",
  );
  expect(LegacyPicker.instances).toHaveLength(0);
});
