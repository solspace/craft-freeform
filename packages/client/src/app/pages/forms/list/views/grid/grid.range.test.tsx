import type { FormWithGroup } from "@ff-client/types/form-groups";
import {
  focusManager,
  onlineManager,
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useCardRange } from "./grid.range";

const fixture = vi.hoisted(() => ({
  site: "english",
  siteId: 2,
  post: vi.fn(),
  load: vi.fn(),
  error: vi.fn(),
}));
vi.mock("@ff-client/contexts/site/site.context", () => ({
  useSiteContext: () => ({
    current: { id: fixture.siteId },
    getCurrentHandleWithFallback: () => fixture.site,
  }),
}));
vi.mock("axios", () => ({ default: { post: fixture.post } }));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));
vi.mock("@ff-client/utils/notifications", () => ({
  notifications: { error: fixture.error },
}));
const data = { forms: [], cardRange: 30 } as FormWithGroup;
const Harness = () => {
  const query = useQuery<FormWithGroup>({
    queryKey: ["groups", fixture.site],
    queryFn: ({ signal }) => fixture.load(signal),
    staleTime: Infinity,
    refetchOnWindowFocus: "always",
    refetchOnReconnect: "always",
    retry: false,
  });
  const range = useCardRange(query.data?.cardRange);
  return (
    <button
      type="button"
      data-saving={range.isSaving}
      onClick={() => void range.change(7)}
    >
      {range.days}
    </button>
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
const click = async () => {
  await act(async () => host.querySelector("button").click());
};
beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  fixture.site = "english";
  fixture.siteId = 2;
  fixture.post.mockReset();
  fixture.load.mockReset().mockResolvedValue(data);
  fixture.error.mockReset();
  client = new QueryClient();
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
it("restores a failed range save while preserving unrelated refreshed data", async () => {
  let reject: (error: Error) => void;
  fixture.post.mockReturnValue(
    new Promise((_yes, no) => {
      reject = no;
    }),
  );
  await render();
  await click();
  expect(host.textContent).toBe("7");
  await act(async () => {
    client.setQueryData(["groups", "english"], { ...data, extra: "retained" });
    reject(new Error("offline"));
  });
  expect(host.textContent).toBe("30");
  expect(client.getQueryData(["groups", "english"])).toMatchObject({
    cardRange: 30,
    extra: "retained",
  });
  expect(fixture.error).toHaveBeenCalledOnce();
});
it.each(["focus", "reconnect"])(
  "cancels stale %s reloads when confirming a pending range",
  async (event) => {
    let resolveSave: () => void, resolveReload: (data: FormWithGroup) => void;
    fixture.post.mockReturnValue(
      new Promise<void>((yes) => {
        resolveSave = yes;
      }),
    );
    fixture.load.mockReturnValue(
      new Promise<FormWithGroup>((yes) => {
        resolveReload = yes;
      }),
    );
    await render();
    await click();
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
    const signal = fixture.load.mock.calls[0][0] as AbortSignal;
    expect(host.textContent).toBe("7");
    await act(async () => resolveSave());
    expect(signal.aborted).toBe(true);
    await act(async () => resolveReload(data));
    expect(host.textContent).toBe("7");
  },
);
it("finishes a pending save in its original site after switching sites", async () => {
  let resolve: () => void;
  fixture.post.mockReturnValue(
    new Promise<void>((yes) => {
      resolve = yes;
    }),
  );
  client.setQueryData(["groups", "french"], data);
  await render();
  await click();
  fixture.site = "french";
  fixture.siteId = 3;
  await render();
  expect(host.textContent).toBe("30");
  await act(async () => resolve());
  expect(host.textContent).toBe("30");
  expect(client.getQueryData(["groups", "english"])).toMatchObject({
    cardRange: 7,
  });
});
