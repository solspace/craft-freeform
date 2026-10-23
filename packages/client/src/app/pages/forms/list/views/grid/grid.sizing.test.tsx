import type { FormWithGroup } from "@ff-client/types/form-groups";
import type { FormWithStats } from "@ff-client/types/forms";
import {
  focusManager,
  onlineManager,
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCardSizing } from "./grid.sizing";

const fixture = vi.hoisted(() => ({
  contentMode: false,
  site: "english",
  siteId: 2,
  post: vi.fn(),
  load: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));
vi.mock("@ff-client/contexts/site/site.context", () => ({
  useSiteContext: () => ({
    current: { id: fixture.siteId },
    getCurrentHandleWithFallback: () => fixture.site,
  }),
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));
vi.mock("@ff-client/utils/notifications", () => ({
  notifications: { success: fixture.success, error: fixture.error },
}));
vi.mock("axios", () => ({ default: { post: fixture.post } }));
const form = (id: number) => ({ id, cardSize: "1x1" }) as FormWithStats;
const data: FormWithGroup = {
  forms: [form(1)],
  formGroups: {
    siteId: 2,
    groups: [{ uid: "a", forms: [form(2)], formIds: [2] }],
  },
};
const deferred = <T,>() => {
  let resolve: (value: T) => void;
  let reject: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return {
    promise,
    resolve: (value: T) => resolve(value),
    reject: (error: Error) => reject(error),
  };
};
const Harness = () => {
  const query = useQuery<FormWithGroup>({
    queryKey: ["groups", fixture.site],
    queryFn: ({ signal }) => fixture.load(signal),
    staleTime: Infinity,
    refetchOnWindowFocus: "always",
    refetchOnReconnect: "always",
    retry: false,
  });
  const sizing = useCardSizing();
  return (
    <div data-saving={sizing.isSaving}>
      {[
        ...(query.data?.forms ?? []),
        ...(query.data?.formGroups?.groups.flatMap((group) => group.forms) ??
          []),
      ].map((form) => (
        <button
          type="button"
          key={form.id}
          data-id={form.id}
          data-size={sizing.getSize(form)}
          data-content={sizing.getContent(form)}
          data-field={sizing.getFieldId(form)}
          onClick={() =>
            void (fixture.contentMode
              ? sizing.setContent(form, "field", 9)
              : sizing.resize(form, "2x2"))
          }
        >
          {form.id}
        </button>
      ))}
    </div>
  );
};
let client: QueryClient, root: Root, host: HTMLDivElement;
const render = async () => {
  await act(async () =>
    root.render(
      <QueryClientProvider client={client}>
        <Harness />
      </QueryClientProvider>,
    ),
  );
};
const click = async (id: number) => {
  await act(async () =>
    host.querySelector<HTMLButtonElement>(`[data-id='${id}']`).click(),
  );
};
const size = (id: number) =>
  host.querySelector<HTMLElement>(`[data-id='${id}']`)?.dataset.size;
beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  fixture.contentMode = false;
  fixture.site = "english";
  fixture.siteId = 2;
  fixture.post.mockReset();
  fixture.load.mockReset().mockResolvedValue(data);
  fixture.success.mockReset();
  fixture.error.mockReset();
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(["groups", "english"], data);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  client.clear();
  host.remove();
  focusManager.setFocused(undefined);
  onlineManager.setOnline(true);
});
describe("dashboard card size persistence", () => {
  it("saves grouped cards and prevents overlapping saves", async () => {
    const save = deferred<void>();
    fixture.post.mockReturnValue(save.promise);
    await render();
    await click(2);
    await click(1);
    expect(size(2)).toBe("2x2");
    expect(size(1)).toBe("1x1");
    expect(fixture.post).toHaveBeenCalledExactlyOnceWith(
      "/api/forms/cards/size",
      { formId: 2, siteId: 2, size: "2x2" },
      { timeout: 15_000 },
    );
    await act(async () => save.resolve());
    expect(fixture.success).toHaveBeenCalledOnce();
    expect(host.firstElementChild.getAttribute("data-saving")).toBe("false");
    expect(
      client.getQueryData<FormWithGroup>(["groups", "english"]).formGroups
        .groups[0].forms[0].cardSize,
    ).toBe("2x2");
  });
  it("restores only the resized card after a failed or interrupted save", async () => {
    const save = deferred<void>();
    fixture.post.mockReturnValue(save.promise);
    await render();
    await click(1);
    await act(async () => {
      client.setQueryData<FormWithGroup>(["groups", "english"], (current) => ({
        ...current,
        forms: [...current.forms, form(3)],
      }));
      save.reject(new Error("timeout"));
    });
    expect(size(1)).toBe("1x1");
    expect(size(3)).toBe("1x1");
    expect(fixture.error).toHaveBeenCalledOnce();
    expect(fixture.success).not.toHaveBeenCalled();
    expect(host.firstElementChild.getAttribute("data-saving")).toBe("false");
  });
  it("cancels a delayed reload before resizing and ignores its late result", async () => {
    const reload = deferred<FormWithGroup>();
    fixture.load.mockReturnValue(reload.promise);
    await render();
    let loading: Promise<void>;
    await act(async () => {
      loading = client.refetchQueries({ queryKey: ["groups", "english"] });
    });
    const signal = fixture.load.mock.calls[0][0] as AbortSignal;
    await click(1);
    expect(signal.aborted).toBe(true);
    expect(size(1)).toBe("2x2");
    await act(async () => {
      reload.resolve(data);
      await loading;
    });
    expect(size(1)).toBe("2x2");
  });
  it.each(["focus", "reconnect"])(
    "preserves a pending resize through %s reloads and cancels a stale result on completion",
    async (event) => {
      const save = deferred<void>(),
        reload = deferred<FormWithGroup>();
      fixture.post.mockReturnValue(save.promise);
      fixture.load.mockReturnValue(reload.promise);
      await render();
      await click(1);
      await act(async () => {
        if (event === "focus") {
          focusManager.setFocused(false);
          focusManager.setFocused(true);
        } else {
          onlineManager.setOnline(false);
          onlineManager.setOnline(true);
        }
        await Promise.resolve();
      });
      expect(fixture.load).toHaveBeenCalled();
      expect(size(1)).toBe("2x2");
      const signal = fixture.load.mock.calls[0][0] as AbortSignal;
      await act(async () => save.resolve());
      expect(signal.aborted).toBe(true);
      await act(async () => reload.resolve(data));
      expect(size(1)).toBe("2x2");
    },
  );
  it("keeps site preferences separate when a save finishes after switching sites", async () => {
    const save = deferred<void>();
    fixture.post.mockReturnValue(save.promise);
    client.setQueryData(["groups", "french"], data);
    await render();
    await click(1);
    fixture.site = "french";
    fixture.siteId = 3;
    await render();
    expect(size(1)).toBe("1x1");
    await act(async () => save.resolve());
    expect(size(1)).toBe("1x1");
    expect(
      client.getQueryData<FormWithGroup>(["groups", "english"]).forms[0]
        .cardSize,
    ).toBe("2x2");
    expect(
      client.getQueryData<FormWithGroup>(["groups", "french"]).forms[0]
        .cardSize,
    ).toBe("1x1");
  });
  it("reports a failed focus reload without dropping the requested size", async () => {
    const save = deferred<void>();
    fixture.post.mockReturnValue(save.promise);
    fixture.load.mockRejectedValue(new Error("offline"));
    await render();
    await click(1);
    await act(async () => {
      focusManager.setFocused(false);
      focusManager.setFocused(true);
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
    expect(size(1)).toBe("2x2");
    await act(async () => save.resolve());
    expect(size(1)).toBe("2x2");
  });
});

it("rolls back failed content preferences without losing another card or a size change", async () => {
  fixture.contentMode = true;
  const save = deferred<void>();
  fixture.post.mockReturnValue(save.promise);
  await render();
  await click(1);
  expect(host.querySelector<HTMLElement>("[data-id='1']").dataset.content).toBe(
    "field",
  );
  expect(fixture.post).toHaveBeenCalledWith(
    "/api/forms/cards/preferences",
    { formId: 1, siteId: 2, content: "field", fieldId: 9 },
    { timeout: 15_000 },
  );
  await act(async () => {
    client.setQueryData<FormWithGroup>(["groups", "english"], (current) => ({
      ...current,
      forms: current.forms.map((form) => ({ ...form, cardSize: "2x1" })),
    }));
    save.reject(new Error("offline"));
  });
  const card = host.querySelector<HTMLElement>("[data-id='1']");
  expect(card.dataset.content).toBe("overview");
  expect(card.dataset.field).toBeUndefined();
  expect(card.dataset.size).toBe("2x1");
});
