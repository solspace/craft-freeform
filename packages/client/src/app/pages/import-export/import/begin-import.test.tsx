import type { ComponentType, ReactNode } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ImportExpressForms } from "./express-forms/express-forms";
import { ImportFormie } from "./formie/v3";
import { ImportFreeformData } from "./freeform-data/freeform-data";
import type { ImportOptions } from "./import.types";

const state = vi.hoisted(() => ({
  active: false,
  post: vi.fn(),
  clear: vi.fn(),
  trigger: vi.fn(),
  data: {
    forms: [{ uid: "qa-form", name: "QA Form" }],
    templates: {
      pdf: [] as unknown[],
      wrapper: [] as unknown[],
      notification: [] as unknown[],
      formatting: [] as unknown[],
      success: [] as unknown[],
    },
    formSubmissions: [] as unknown[],
  },
}));
vi.mock("axios", () => ({ default: { post: state.post } }));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));
vi.mock("@ff-client/utils/urls", () => ({
  generateUrl: (path: string) => path,
}));
vi.mock("@components/breadcrumbs/breadcrumbs", () => ({
  Breadcrumb: (): null => null,
}));
vi.mock("@components/layout/blocks/content-container", () => ({
  ContentContainer: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));
vi.mock("@components/loaders/loading-text/loading-text", () => ({
  LoadingText: ({ children }: { children: ReactNode }) => (
    <span>{children}</span>
  ),
}));
vi.mock("../common/progress/progress", () => ({ Progress: (): null => null }));
vi.mock("../common/progress/progress.hooks", () => ({
  useProgressEvent: () => ({
    progress: { active: state.active },
    clearProgress: state.clear,
    triggerProgress: state.trigger,
  }),
}));
vi.mock("../common/strategy/strategy", () => ({ Strategy: (): null => null }));
vi.mock("../common/preview/preview", () => ({
  Preview: ({
    options,
    onUpdate,
    disabled,
  }: {
    options: ImportOptions;
    onUpdate: (value: Partial<ImportOptions>) => void;
    disabled: boolean;
  }) => (
    <input
      type="checkbox"
      aria-label="Select form"
      checked={!!options.forms.length}
      disabled={disabled}
      onChange={() =>
        onUpdate({ forms: options.forms.length ? [] : ["qa-form"] })
      }
    />
  ),
}));
vi.mock("./formie/v3/fomie.queries", () => ({
  useFormieDataQuery: () => ({ data: state.data, isFetching: false }),
}));
vi.mock("./express-forms/express-forms.queries", () => ({
  useExpressFormsDataQuery: () => ({ data: state.data, isFetching: false }),
}));

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  state.active = false;
  state.clear.mockReset();
  state.trigger.mockReset();
  state.post.mockReset().mockImplementation(async (url: string) => ({
    data:
      url === "/api/import/file"
        ? { token: "file-token", options: state.data }
        : { token: "import-token" },
  }));
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

describe.each([
  ["Formie v3", ImportFormie],
  ["Express Forms", ImportExpressForms],
  ["Freeform file", ImportFreeformData],
] as const)("%s import", (_label, Page: ComponentType) => {
  async function render() {
    await act(async () => root.render(<Page />));
    const upload = host.querySelector<HTMLInputElement>('input[type="file"]');
    if (upload) {
      Object.defineProperty(upload, "files", {
        value: [new File(["fixture"], "fixture.zip")],
      });
      await act(async () =>
        upload.dispatchEvent(new Event("change", { bubbles: true })),
      );
      state.post.mockClear();
    }
  }
  const button = () =>
    Array.from(host.querySelectorAll("button")).find(
      (item) => item.textContent === "Begin Import",
    )!;
  const select = () =>
    host.querySelector<HTMLInputElement>('[aria-label="Select form"]')!;

  it("cannot begin import with no selected data, including after clearing a selection", async () => {
    await render();
    expect(button().disabled).toBe(true);
    act(() => button().click());
    expect(state.post).not.toHaveBeenCalled();
    expect(state.clear).not.toHaveBeenCalled();
    act(() => select().click());
    expect(button().disabled).toBe(false);
    act(() => select().click());
    expect(button().disabled).toBe(true);
  });

  it("starts only with selected data and blocks the control during an active import", async () => {
    await render();
    act(() => select().click());
    await act(async () => button().click());
    expect(state.post).toHaveBeenCalledOnce();
    expect(state.post).toHaveBeenCalledWith(
      "/api/import/prepare",
      expect.objectContaining({
        options: expect.objectContaining({ forms: ["qa-form"] }),
      }),
    );
    expect(state.trigger).toHaveBeenCalledWith(
      "/api/import?server-token=import-token",
    );
    state.active = true;
    await act(async () => root.render(<Page />));
    expect(button().disabled).toBe(true);
    expect(select().disabled).toBe(true);
    act(() => button().click());
    expect(state.post).toHaveBeenCalledOnce();
  });
});
