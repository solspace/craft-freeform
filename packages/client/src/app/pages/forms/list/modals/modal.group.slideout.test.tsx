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
  default: (text: string) => text,
}));
vi.mock("@components/form-controls", () => ({
  FormComponent: ({
    value,
    property,
    updateValue,
  }: {
    value: string;
    property: { handle: string };
    updateValue: (value: string) => void;
  }) => (
    <input
      aria-label={property.handle}
      value={value}
      onChange={(event) => updateValue(event.target.value)}
    />
  ),
}));
vi.mock("@components/loaders/loading-text/loading-text", () => ({
  LoadingText: ({ children }: { children: ReactNode }) => (
    <span>{children}</span>
  ),
}));
vi.mock("@components/modals/modal.animations", () => ({
  useAnimateOverlay: () => ({}),
  useAnimateModals: () => () => null,
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
    settings: { containerAttributes?: Record<string, string> },
  ) {
    for (const [name, value] of Object.entries(
      settings.containerAttributes ?? {},
    )) {
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
      Manage Form Groups
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
  act(() => button("Manage Form Groups").click());
  return Panel.instances.at(-1)!;
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("Craft", { Slideout: Panel });
  fixture.mutate.mockClear();
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

describe("Manage Form Groups slideout", () => {
  it("adds, reorders, and removes groups while retaining unassigned forms", () => {
    const panel = open();
    act(() => button("Add Group").click());
    const inputs = panel.container.querySelectorAll("input");
    const newInput = inputs[1];
    const newGroup = newInput.closest<HTMLElement>("[data-id]")!;
    const uid = newGroup.dataset.id;
    act(() => {
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!.call(newInput, "News");
      newInput.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const oldGroup = panel.container.querySelector<HTMLElement>(
      '[data-id="contact"]',
    )!;
    const groupWrapper = oldGroup.parentElement!;
    const forms =
      newGroup.querySelector("input")!.parentElement!.nextElementSibling!;
    act(() => {
      forms.append(panel.container.querySelector('[data-id="22"]')!);
      groupWrapper.prepend(newGroup);
      const onFilter = Sortable.get(groupWrapper)!.option("onFilter")!;
      onFilter.call(Sortable.get(groupWrapper)!, {
        item: oldGroup,
      } as Sortable.SortableEvent);
    });
    act(() => button("Save").click());
    expect(fixture.mutate).toHaveBeenCalledExactlyOnceWith({
      siteId: 1,
      site: "english",
      groups: [{ uid, label: "News", formIds: [22] }],
      orderedFormIds: [22, 11],
    });
  });

  it("saves renamed groups and drag-and-drop assignments and cleans up after success", () => {
    const panel = open();
    const group = panel.container.querySelector<HTMLElement>(
      '[data-id="contact"]',
    )!;
    const forms = group.querySelector('[data-id="11"]')!
      .parentElement as HTMLDivElement;
    const unassigned = panel.container.querySelector('[data-id="22"]')!
      .parentElement as HTMLDivElement;
    act(() => {
      forms.append(unassigned.querySelector('[data-id="22"]')!);
      const input = panel.container.querySelector("input")!;
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!.call(input, "Requests");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    act(() => button("Save").click());
    expect(fixture.mutate).toHaveBeenCalledExactlyOnceWith({
      siteId: 1,
      site: "english",
      groups: [{ uid: "contact", label: "Requests", formIds: [11, 22] }],
      orderedFormIds: [11, 22],
    });
    expect(button("Save").disabled).toBe(true);
    expect(panel.close).not.toHaveBeenCalled();
    act(() => fixture.resolve());
    expect(panel.close).toHaveBeenCalledOnce();
    act(() => panel.onClose?.());
    expect(panel.destroy).toHaveBeenCalledOnce();
    expect(Sortable.get(forms)).toBeNull();
    expect(Sortable.get(unassigned)).toBeNull();
  });

  it("keeps the editor open on failure and supports retrying without duplicate Sortables", () => {
    const panel = open();
    act(() => button("Save").click());
    act(() => fixture.reject());
    expect(panel.container.querySelector('[role="alert"]')?.textContent).toBe(
      "Something went wrong!",
    );
    expect(panel.close).not.toHaveBeenCalled();
    expect(button("Save").disabled).toBe(false);
    act(() => button("Save").click());
    expect(fixture.mutate).toHaveBeenCalledTimes(2);
    expect(panel.container.querySelector('[role="alert"]')).toBeNull();
    expect(Panel.instances).toHaveLength(1);
  });

  it("does not save unloaded data and resets state when reopened", () => {
    fixture.query.data = undefined;
    open();
    expect(button("Save").disabled).toBe(true);
    expect(button("Add Group").disabled).toBe(true);
    const panel = Panel.instances.at(-1)!;
    act(() => button("Close").click());
    act(() => panel.onClose?.());
    expect(fixture.mutate).not.toHaveBeenCalled();
    open();
    expect(Panel.instances).toHaveLength(2);
  });
});
