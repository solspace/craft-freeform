import { act, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  previewNoticePosition,
  WizardPreviewNotice,
} from "./wizard.preview-notice";

vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));
let host: HTMLDivElement;
let root: Root;
function Example({ enabled = true }: { enabled?: boolean }) {
  const dialog = useRef<HTMLDivElement>(null);
  return (
    <div data-surface>
      <div ref={dialog} role="dialog">
        <button type="button">Inside wizard</button>
      </div>
      <div role="menu">
        <button type="button">Choose a template</button>
      </div>
      <WizardPreviewNotice dialog={dialog} enabled={enabled} />
    </div>
  );
}
const press = (element: Element, x = 100, y = 200) =>
  act(() =>
    element.dispatchEvent(
      new MouseEvent("pointerdown", {
        bubbles: true,
        button: 0,
        clientX: x,
        clientY: y,
      }),
    ),
  );
const surface = () => host.querySelector("[data-surface]")!;
const notice = () => host.querySelector(".wizard-preview-notice");
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.useFakeTimers();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root.render(<Example />));
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it("explains a background click at its location without stealing keyboard focus", () => {
  const input = host.querySelector("button")!;
  input.focus();
  press(surface());
  expect(notice()?.textContent).toContain("Just a preview for now");
  expect(notice()?.textContent).toContain(
    "Complete guided setup, then choose Create form on the final step",
  );
  expect(
    host.querySelector<HTMLElement>(".wizard-preview-ripple")?.style.left,
  ).toBe("100px");
  expect(host.querySelector('[role="status"]')?.getAttribute("aria-live")).toBe(
    "polite",
  );
  expect(document.activeElement).toBe(input);
  act(() => vi.advanceTimersByTime(6000));
  expect(notice()).toBeNull();
});

it("restarts the notice for a new click and ignores wizard controls and menus", () => {
  press(surface());
  act(() => vi.advanceTimersByTime(3000));
  press(surface(), 500, 350);
  act(() => vi.advanceTimersByTime(3100));
  expect(notice()).not.toBeNull();
  expect(
    host.querySelector<HTMLElement>(".wizard-preview-ripple")?.style.left,
  ).toBe("500px");
  press(host.querySelector('[role="menu"] button')!);
  expect(notice()).toBeNull();
  press(host.querySelector('[role="dialog"] button')!);
  expect(notice()).toBeNull();
});

it("stops explaining clicks when the preview is hidden or the form has been created", () => {
  press(surface());
  act(() => root.render(<Example enabled={false} />));
  expect(notice()).toBeNull();
  press(surface());
  expect(notice()).toBeNull();
  act(() => vi.advanceTimersByTime(10000));
  expect(notice()).toBeNull();
});

it("keeps the note beside the wizard and within the screen near its bottom edge", () => {
  const position = previewNoticePosition(
    { x: 790, y: 780 },
    { left: 850, right: 1560, top: 80, bottom: 760 },
    1600,
    800,
    { width: 288, height: 142 },
  );
  expect(position.x + 288).toBeLessThan(850);
  expect(position.y + 142).toBeLessThanOrEqual(788);
  expect(position.x).toBeGreaterThanOrEqual(12);
});
