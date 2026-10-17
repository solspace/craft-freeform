import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  PRESET_FIELD_DURATION,
  useWizardPresetAnimation,
} from "./wizard.preset-animation";
import type { WizardDraft } from "./wizard.types";

let host: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
const empty = { purpose: "", fields: [] } as WizardDraft;
const preset = {
  purpose: "quote",
  fields: ["Name", "Email", "Message"].map((label) => ({
    key: label,
    label,
    type: "text",
  })),
} as WizardDraft;
function Harness({
  draft,
  enabled = true,
  skip = 0,
}: {
  draft: WizardDraft;
  enabled?: boolean;
  skip?: number;
}) {
  const preview = useWizardPresetAnimation(draft, enabled, skip);
  return (
    <div data-active={preview.active}>
      {preview.preview.fields.map((field) => field.label).join(",")}
    </div>
  );
}
const render = (draft: WizardDraft, enabled = true, skip = 0) =>
  act(() =>
    root.render(<Harness draft={draft} enabled={enabled} skip={skip} />),
  );
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.useFakeTimers();
  host = document.createElement("div");
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it("adds starting fields individually while keeping the complete wizard draft", () => {
  render(empty);
  render(preset);
  expect(host.textContent).toBe("Name");
  expect(preset.fields).toHaveLength(3);
  act(() => vi.advanceTimersByTime(PRESET_FIELD_DURATION));
  expect(host.textContent).toBe("Name,Email");
  act(() => vi.advanceTimersByTime(PRESET_FIELD_DURATION));
  expect(host.textContent).toBe("Name,Email,Message");
});
it("skipping instantly shows every field and cancels the sequence", () => {
  render(empty);
  render(preset);
  render(preset, true, 1);
  expect(host.textContent).toBe("Name,Email,Message");
  expect(host.firstElementChild?.getAttribute("data-active")).toBe("false");
  act(() => vi.advanceTimersByTime(PRESET_FIELD_DURATION * 10));
  expect(host.textContent).toBe("Name,Email,Message");
});
it("stops immediately when editing or moving to the next step", () => {
  render(empty);
  render(preset);
  const edited = {
    ...preset,
    fields: [
      { ...preset.fields[0], label: "Changed" },
      ...preset.fields.slice(1),
    ],
  };
  render(edited);
  expect(host.textContent).toBe("Changed,Email,Message");
  render({ ...preset, purpose: "contact" });
  render({ ...preset, purpose: "contact" }, false);
  expect(host.textContent).toBe("Name,Email,Message");
});
it("does not replay a resumed draft or animate when motion is disabled", () => {
  render(preset);
  expect(host.textContent).toBe("Name,Email,Message");
  render(empty, false);
  render(preset, false);
  expect(host.textContent).toBe("Name,Email,Message");
  expect(host.firstElementChild?.getAttribute("data-active")).toBe("false");
});
