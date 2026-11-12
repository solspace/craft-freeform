import { DisclosureSelect } from "@lib/cp/widgets/disclosure-select";
import { afterEach, expect, it, vi } from "vitest";

vi.mock("@lib/cp/widgets/disclosure-select", () => ({
  DisclosureSelect: vi.fn(),
}));
vi.mock("@lib/cp/widgets/frame-session", () => ({
  manageWidgetFrameSession: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

it("keeps native Craft selects visible while enhancing legacy widget selects", async () => {
  vi.resetModules();
  vi.spyOn(document, "readyState", "get").mockReturnValue("complete");
  document.body.innerHTML = `<form class="widget-editor">
    <craft-select><select slot="input" name="groupUid"><option>Other</option></select></craft-select>
    <div class="select"><select name="legacy"><option>Line</option></select></div>
    <div id="settings-chartSize-field"><select name="chartSize"><option>Large</option></select></div>
  </form>`;
  await import("./frame");
  expect(DisclosureSelect).toHaveBeenCalledExactlyOnceWith(
    document.querySelector('[name="legacy"]'),
  );
  const nativeSelect = document.querySelector<HTMLSelectElement>(
    "craft-select > select",
  );
  expect(nativeSelect?.hidden).toBe(false);
  expect(nativeSelect?.getAttribute("slot")).toBe("input");
});

it.each([true, false])(
  "announces rendered health availability %s before the window load event",
  async (ready) => {
    vi.resetModules();
    const postMessage = vi.fn();
    vi.spyOn(window, "parent", "get").mockReturnValue({
      postMessage,
    } as unknown as Window);
    vi.spyOn(document, "readyState", "get").mockReturnValue("complete");
    document.body.innerHTML = `<main class="form-card-widget"><section data-freeform-health-ready="${ready}"></section></main>`;
    await import("./frame");
    expect(postMessage).toHaveBeenCalledExactlyOnceWith(
      { type: "freeform-widget-ready", healthReady: ready },
      window.location.origin,
    );
  },
);

it("does not announce widget readiness from an editor or top-level page", async () => {
  vi.resetModules();
  const postMessage = vi.fn();
  vi.spyOn(window, "parent", "get").mockReturnValue({
    postMessage,
  } as unknown as Window);
  vi.spyOn(document, "readyState", "get").mockReturnValue("complete");
  document.body.innerHTML = '<form class="widget-editor"></form>';
  await import("./frame");
  expect(postMessage).not.toHaveBeenCalled();
});
