import { ModalProvider } from "@components/modals/modal.context";
import type {
  FormWithGroup,
  UpdateFormGroup,
} from "@ff-client/types/form-groups";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import Sortable from "sortablejs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useEditGroupModal } from "./hooks/use-edit-group-modal";

const fixture = vi.hoisted(() => ({
  query: { data: undefined as FormWithGroup | undefined, isError: false },
  mutate: vi.fn(),
  resolve: () => {},
  reject: () => {},
}));
vi.mock("@ff-client/queries/form-groups", () => ({
  useFetchFormGroups: () => fixture.query,
}));
vi.mock("@ff-client/contexts/site/site.context", () => ({
  useSiteContext: () => ({
    current: { id: 1, handle: "english" },
    getCurrentHandleWithFallback: () => "english",
  }),
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string, values: Record<string, string | number> = {}) =>
    text.replace(/\{(\w+)\}/g, (match, key) => String(values[key] ?? match)),
}));
vi.mock("@components/loaders/loading-text/loading-text", () => ({
  LoadingText: ({ children }: { children: ReactNode }) => (
    <span>{children}</span>
  ),
}));
vi.mock("@components/modals/modal.animations", () => ({
  useAnimateOverlay: () => ({}),
  useAnimateModals: () => (): null => null,
}));
vi.mock("./modal.list-item.queries", async () => {
  const { useState } = await import("react");
  return {
    useFormGroupsMutation: (options: {
      onSuccess: () => void;
      onError: (error: { message: string; errors: object }) => void;
    }) => {
      const [isPending, setPending] = useState(false);
      fixture.resolve = () => {
        setPending(false);
        options.onSuccess();
      };
      fixture.reject = () => {
        setPending(false);
        options.onError({ message: "Failed", errors: {} });
      };
      return {
        isPending,
        mutate: (payload: UpdateFormGroup) => {
          fixture.mutate(payload);
          setPending(true);
        },
      };
    },
  };
});

class Panel {
  static instances: Panel[] = [];
  container = document.createElement("div");
  $container = { 0: this.container };
  $outerContainer = { 0: this.container };
  onClose?: () => void;
  onBeforeClose?: () => void;
  open = vi.fn();
  close = vi.fn(() => this.onBeforeClose?.());
  destroy = vi.fn(() => this.container.remove());

  constructor(
    host: HTMLElement,
    settings: { containerAttributes: Record<string, string> },
  ) {
    for (const [name, value] of Object.entries(settings.containerAttributes)) {
      this.container.setAttribute(name, value);
    }
    this.container.append(host);
    document.body.append(this.container);
    Panel.instances.push(this);
  }
  on(event: string, callback: () => void) {
    if (event === "close") this.onClose = callback;
    else this.onBeforeClose = callback;
  }
}

let root: Root;
let container: HTMLDivElement;
const button = (label: string): HTMLButtonElement =>
  Array.from(document.querySelectorAll("button")).find(
    (element) => element.textContent === label,
  )!;
function Launcher() {
  const open = useEditGroupModal();
  return (
    <button type="button" onClick={open}>
      Form Groups
    </button>
  );
}
function render() {
  act(() =>
    root.render(
      <ModalProvider>
        <Launcher />
      </ModalProvider>,
    ),
  );
}
function open() {
  act(() => button("Form Groups").click());
  return Panel.instances.at(-1)!;
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("Craft", { Slideout: Panel });
  fixture.mutate.mockClear();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
      unobserve() {}
    },
  );
  fixture.query.isError = false;
  fixture.query.data = {
    formGroups: {
      siteId: 1,
      site: "english",
      groups: [
        {
          uid: "contact",
          label: "Contact",
          formIds: [11],
          forms: [
            {
              id: 11,
              name: "Contact Form",
              dateArchived: null,
              settings: { general: { color: "#123abc" } },
            },
          ],
        },
      ],
    },
    forms: [
      {
        id: 22,
        name: "Newsletter",
        dateArchived: null,
        settings: { general: { color: "#abcdef" } },
      },
    ],
  } as unknown as FormWithGroup;
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  render();
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  Panel.instances = [];
  vi.unstubAllGlobals();
});

function ariaButton(label: string): HTMLButtonElement {
  return Array.from(document.querySelectorAll("button")).find(
    (element) => element.getAttribute("aria-label") === label,
  )!;
}
function changeInput(input: HTMLInputElement, value: string) {
  act(() => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
function rename(panel: Panel, name: string, nextName: string) {
  act(() => ariaButton(`Rename ${name}`).click());
  const input = panel.container.querySelector("input")!;
  changeInput(input, nextName);
  act(() => input.blur());
}
function drag(item: HTMLElement, target: HTMLElement, index: number) {
  const source = item.parentElement!;
  const oldIndex = Array.from(source.children).indexOf(item);
  const sortable = Sortable.get(source)!;
  act(() => {
    const siblings = Array.from(target.children).filter(
      (child) =>
        child !== item &&
        (child.classList.contains("form-group-item") ||
          child.classList.contains("form-group")),
    );
    target.insertBefore(item, siblings[index] || null);
    const onEnd = sortable.option("onEnd")!;
    onEnd.call(sortable, {
      item,
      from: source,
      to: target,
      oldIndex,
      newIndex: index,
      newDraggableIndex: index,
    } as Sortable.SortableEvent);
  });
}

describe("Form groups slideout", () => {
  it("starts unchanged, renames inline, and cleans up Sortables after saving", () => {
    const panel = open();
    expect(panel.container.getAttribute("aria-label")).toBe("Form groups");
    expect(button("Save changes").disabled).toBe(true);
    const forms = panel.container.querySelector<HTMLElement>(
      '[data-group-uid="contact"]',
    )!;
    const unassigned =
      panel.container.querySelector('[data-id="22"]')!.parentElement!;
    rename(panel, "Contact", "Requests");
    expect(button("Save changes").disabled).toBe(false);
    act(() => button("Save changes").click());
    expect(fixture.mutate).toHaveBeenCalledExactlyOnceWith({
      siteId: 1,
      site: "english",
      groups: [{ uid: "contact", label: "Requests", formIds: [11] }],
      orderedFormIds: [11, 22],
    });
    expect(button("Save changes").disabled).toBe(true);
    expect(ariaButton("Rename Requests").disabled).toBe(true);
    expect(Sortable.get(forms)!.option("disabled")).toBe(true);
    act(() => fixture.resolve());
    expect(panel.close).toHaveBeenCalledOnce();
    act(() => panel.onClose?.());
    expect(panel.destroy).toHaveBeenCalledOnce();
    expect(Sortable.get(forms)).toBeNull();
    expect(Sortable.get(unassigned)).toBeNull();
  });

  it("adds a focused empty group, updates live counts after repeated drags, and saves order", () => {
    const panel = open();
    act(() => button("Add group").click());
    const input = panel.container.querySelector("input")!;
    expect(document.activeElement).toBe(input);
    const newGroup = input.closest<HTMLElement>(".form-group")!;
    const uid = newGroup.dataset.id;
    expect(newGroup.textContent).toContain("Drop forms here");
    changeInput(input, "News");
    act(() => input.blur());
    const forms = newGroup.querySelector<HTMLElement>("[data-group-uid]")!;
    drag(panel.container.querySelector('[data-id="22"]')!, forms, 0);
    expect(newGroup.querySelector('[aria-label="1 forms"]')).not.toBeNull();
    // Move back and across again to exercise React reconciliation after a DOM drag.
    const unassigned = panel.container.querySelector<HTMLElement>(
      '[aria-label="Unassigned forms"] [id]',
    )!;
    drag(panel.container.querySelector('[data-id="22"]')!, unassigned, 0);
    drag(panel.container.querySelector('[data-id="22"]')!, forms, 0);
    expect(panel.container.querySelectorAll('[data-id="22"]')).toHaveLength(1);
    drag(newGroup, newGroup.parentElement!, 0);
    act(() => button("Save changes").click());
    expect(fixture.mutate).toHaveBeenCalledExactlyOnceWith({
      siteId: 1,
      site: "english",
      groups: [
        { uid, label: "News", formIds: [22] },
        { uid: "contact", label: "Contact", formIds: [11] },
      ],
      orderedFormIds: [22, 11],
    });
  });

  it("confirms group removal, preserves its forms, and can cancel removal", () => {
    const panel = open();
    act(() => ariaButton("Remove Contact group").click());
    expect(
      panel.container.querySelector('[role="alert"]')?.textContent,
    ).toContain("Its forms will move to Unassigned");
    act(() => button("Keep group").click());
    expect(button("Save changes").disabled).toBe(true);
    act(() => ariaButton("Remove Contact group").click());
    act(() => button("Remove group").click());
    expect(panel.container.querySelector(".form-group")).toBeNull();
    expect(
      panel.container
        .querySelector('[aria-label="Unassigned forms"]')!
        .querySelectorAll(".form-group-item"),
    ).toHaveLength(2);
    act(() => button("Save changes").click());
    expect(fixture.mutate).toHaveBeenCalledExactlyOnceWith({
      siteId: 1,
      site: "english",
      groups: [],
      orderedFormIds: [22, 11],
    });
  });

  it("moves forms with the menu and closes it with Escape without closing the editor", async () => {
    const panel = open();
    await act(async () => ariaButton("Move Newsletter").click());
    const menu = document.querySelector(
      '[role="dialog"][aria-label="Move Newsletter to"]',
    )!;
    expect(menu).not.toBeNull();
    await act(async () =>
      menu.querySelector<HTMLButtonElement>("button")!.click(),
    );
    expect(
      panel.container
        .querySelector('[data-group-uid="contact"]')!
        .querySelectorAll(".form-group-item"),
    ).toHaveLength(2);
    expect(button("Save changes").disabled).toBe(false);
    await act(async () => ariaButton("Move Newsletter").click());
    await act(async () => {
      document.activeElement!.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    });
    expect(
      document.querySelector(
        '[role="dialog"][aria-label="Move Newsletter to"]',
      ),
    ).toBeNull();
    expect(panel.close).not.toHaveBeenCalled();
  });

  it("supports keyboard group reordering and reverting a rename with Escape", () => {
    const panel = open();
    act(() => ariaButton("Rename Contact").click());
    const input = panel.container.querySelector("input")!;
    changeInput(input, "Changed");
    act(() =>
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      ),
    );
    expect(ariaButton("Rename Contact")).toBeDefined();
    expect(button("Save changes").disabled).toBe(true);
    act(() => button("Add group").click());
    act(() => panel.container.querySelector<HTMLInputElement>("input")!.blur());
    const handle = ariaButton("Reorder New group");
    act(() => {
      handle.focus();
      handle.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Home", bubbles: true }),
      );
    });
    expect(
      panel.container.querySelector(".form-group")!.getAttribute("aria-label"),
    ).toBe("New group group");
    expect(document.activeElement).toBe(handle);
  });

  it("shows only the active drop target and respects reduced motion", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: true })),
    );
    const panel = open();
    const forms = panel.container.querySelector<HTMLElement>(
      '[data-group-uid="contact"]',
    )!;
    const unassigned =
      panel.container.querySelector('[data-id="22"]')!.parentElement!;
    const sortable = Sortable.get(forms)!;
    expect(sortable.option("animation")).toBe(0);
    const onMove = sortable.option("onMove")!;
    act(() => {
      onMove.call(
        sortable,
        { to: forms } as Sortable.MoveEvent,
        new Event("dragover"),
      );
    });
    expect(forms.classList.contains("is-drop-target")).toBe(true);
    act(() => {
      onMove.call(
        sortable,
        { to: unassigned } as Sortable.MoveEvent,
        new Event("dragover"),
      );
    });
    expect(forms.classList.contains("is-drop-target")).toBe(false);
    expect(unassigned.classList.contains("is-drop-target")).toBe(true);
    drag(panel.container.querySelector('[data-id="11"]')!, unassigned, 0);
    expect(panel.container.querySelector(".is-drop-target")).toBeNull();
  });

  it("keeps unsaved edits on failure and supports retrying", () => {
    const panel = open();
    rename(panel, "Contact", "Requests");
    act(() => button("Save changes").click());
    act(() => fixture.reject());
    expect(
      panel.container.querySelector('[role="alert"]')?.textContent,
    ).toContain("Please try again");
    expect(panel.close).not.toHaveBeenCalled();
    expect(button("Save changes").disabled).toBe(false);
    act(() => button("Save changes").click());
    expect(fixture.mutate).toHaveBeenCalledTimes(2);
    expect(panel.container.querySelector('[role="alert"]')).toBeNull();
    expect(Panel.instances).toHaveLength(1);
  });

  it("cancels without mutating cached data and resets when reopened", () => {
    const panel = open();
    act(() => ariaButton("Remove Contact group").click());
    act(() => button("Remove group").click());
    act(() => button("Cancel").click());
    act(() => panel.onClose?.());
    expect(fixture.mutate).not.toHaveBeenCalled();
    open();
    expect(ariaButton("Rename Contact")).toBeDefined();
    expect(button("Save changes").disabled).toBe(true);
    expect(fixture.query.data!.formGroups.groups[0].forms).toHaveLength(1);
  });

  it("does not save unloaded data", () => {
    fixture.query.data = undefined;
    open();
    expect(button("Save changes").disabled).toBe(true);
    expect(button("Add group").disabled).toBe(true);
    expect(fixture.mutate).not.toHaveBeenCalled();
  });

  it("retains group memberships outside the visible forms when editing a group", () => {
    fixture.query.data!.formGroups.groups[0].formIds.push(99);
    const panel = open();
    drag(
      panel.container.querySelector('[data-id="22"]')!,
      panel.container.querySelector('[data-group-uid="contact"]')!,
      0,
    );
    act(() => button("Save changes").click());
    expect(fixture.mutate.mock.calls[0][0].groups[0].formIds).toEqual([
      22, 11, 99,
    ]);
    expect(fixture.mutate.mock.calls[0][0].orderedFormIds).toEqual([22, 11]);
  });
});
