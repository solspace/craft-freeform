import type { ReactNode } from "react";
import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PushState } from "./template.modal";
import type { NotificationTemplateDefaults } from "./template.modal.queries";
import { TemplateStartingPoint } from "./template.starting-point";

const fixture = vi.hoisted(() => ({ confirm: vi.fn(), change: vi.fn() }));
vi.mock("@components/modals/modal.context", () => ({
  useModal: () => ({ confirm: fixture.confirm }),
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));
vi.mock("tinymce/tinymce", () => ({ default: { activeEditor: null } }));

const defaults = {
  name: "Notification",
  handle: "notification",
  description: "",
  subject: "Default subject",
  body: "Default body",
  fromEmail: "sender@example.test",
  wrapperId: 12,
  autoText: true,
  samples: [
    {
      id: "team",
      name: "Team Notification",
      fields: {
        name: "Team Notification",
        handle: "team_notification",
        description: "Team alert",
        subject: "New submission",
        body: "Sample body",
      },
    },
  ],
} as unknown as NotificationTemplateDefaults;

let host: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
function TestEditor({ hidden = false }: { hidden?: boolean }) {
  const [value, setValue] = useState<PushState>(defaults);
  return (
    <div hidden={hidden}>
      <TemplateStartingPoint
        defaults={defaults}
        value={value}
        onChange={(fields) => {
          fixture.change(fields);
          setValue((previous) => ({ ...previous, ...fields }));
        }}
      />
      <button
        type="button"
        onClick={() =>
          setValue((previous) => ({ ...previous, body: "Unsaved edit" }))
        }
      >
        Edit body
      </button>
      <output>{JSON.stringify(value)}</output>
    </div>
  );
}
const render = (node: ReactNode) => act(() => root.render(node));
const choose = (id: string) =>
  act(() => {
    const select = host.querySelector("select")!;
    select.value = id;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.clearAllMocks();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

describe("notification template starting points", () => {
  it("applies sample content while preserving sender and unrelated settings", () => {
    render(<TestEditor />);
    choose("team");
    expect(fixture.confirm).not.toHaveBeenCalled();
    expect(fixture.change).toHaveBeenCalledWith(defaults.samples![0].fields);
    const value = JSON.parse(host.querySelector("output")!.textContent!);
    expect(value.name).toBe("Team Notification");
    expect(value.fromEmail).toBe("sender@example.test");
    expect(value.wrapperId).toBe(12);
    expect(value.autoText).toBe(true);
  });

  it("restores the default template without carrying sample content over", () => {
    render(<TestEditor />);
    choose("team");
    choose("");
    const value = JSON.parse(host.querySelector("output")!.textContent!);
    expect(value.body).toBe("Default body");
    expect(value.handle).toBe("notification");
    expect(fixture.confirm).not.toHaveBeenCalled();
  });

  it("keeps unsaved edits until replacement is confirmed", () => {
    render(<TestEditor />);
    act(() => host.querySelector("button")!.click());
    choose("team");
    expect(fixture.change).not.toHaveBeenCalled();
    expect(host.querySelector("select")!.value).toBe("");
    expect(JSON.parse(host.querySelector("output")!.textContent!).body).toBe(
      "Unsaved edit",
    );
    act(() => fixture.confirm.mock.calls[0][0].onConfirm());
    expect(JSON.parse(host.querySelector("output")!.textContent!).body).toBe(
      "Sample body",
    );
    expect(host.querySelector("select")!.value).toBe("team");
  });

  it("retains the selected sample when switching editor tabs", () => {
    render(<TestEditor />);
    choose("team");
    render(<TestEditor hidden />);
    render(<TestEditor />);
    expect(host.querySelector("select")!.value).toBe("team");
    choose("");
    expect(fixture.confirm).not.toHaveBeenCalled();
  });
});
