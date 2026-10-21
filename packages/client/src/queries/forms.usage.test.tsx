import {
  notifyManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import axios from "axios";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useQueryFormStats, useQueryFormUsage } from "./forms";

vi.mock("axios", () => ({ default: { get: vi.fn() } }));
vi.mock("@editor/store", () => ({ useAppDispatch: vi.fn() }));
vi.mock("@editor/store/slices/form", () => ({ formActions: {} }));
vi.mock("@ff-client/contexts/site/site.context", () => ({
  useSiteContext: () => ({ current: { id: 1 } }),
}));
vi.mock("react-router-dom", () => ({ useParams: () => ({ formId: "2" }) }));

let root: Root;
let container: HTMLDivElement;
let client: QueryClient;
let usage: ReturnType<typeof useQueryFormUsage>;

function UsageProbe({ enabled = true }: { enabled?: boolean }) {
  usage = useQueryFormUsage(enabled);
  return (
    <span>{usage.data?.pages.flatMap((page) => page.items).length ?? 0}</span>
  );
}

function StatsProbe(): null {
  useQueryFormStats(2);
  return null;
}

beforeEach(() => {
  notifyManager.setScheduler(queueMicrotask);
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  client.clear();
  container.remove();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
  notifyManager.setScheduler((callback) => setTimeout(callback, 0));
});

it("fetches five elements first and only requests subsequent batches on demand", async () => {
  vi.mocked(axios.get).mockImplementation(async (_url, config) => {
    const { offset, limit } = config!.params as {
      offset: number;
      limit: number;
    };
    return {
      data: {
        total: 200,
        offset,
        limit,
        items: Array.from(
          { length: Math.min(limit, 200 - offset) },
          (_, i) => ({ id: offset + i + 1 }),
        ),
      },
    };
  });
  await act(async () =>
    root.render(
      <QueryClientProvider client={client}>
        <UsageProbe enabled={false} />
      </QueryClientProvider>,
    ),
  );
  expect(axios.get).not.toHaveBeenCalled();
  await act(async () =>
    root.render(
      <QueryClientProvider client={client}>
        <UsageProbe />
      </QueryClientProvider>,
    ),
  );
  await vi.waitFor(() => expect(usage.data?.pages[0]?.items).toHaveLength(5));
  expect(axios.get).toHaveBeenCalledTimes(1);
  expect(vi.mocked(axios.get).mock.calls[0][1]?.params).toEqual({
    site: 1,
    offset: 0,
    limit: 5,
  });
  await act(async () => {
    await usage.fetchNextPage();
  });
  expect(axios.get).toHaveBeenCalledTimes(2);
  expect(vi.mocked(axios.get).mock.calls[1][1]?.params).toEqual({
    site: 1,
    offset: 5,
    limit: 25,
  });
  expect(usage.data?.pages.flatMap((page) => page.items)).toHaveLength(30);
  expect(usage.hasNextPage).toBe(true);
  await act(async () =>
    root.render(
      <QueryClientProvider client={client}>
        <span />
      </QueryClientProvider>,
    ),
  );
  await act(async () =>
    root.render(
      <QueryClientProvider client={client}>
        <UsageProbe />
      </QueryClientProvider>,
    ),
  );
  expect(axios.get).toHaveBeenCalledTimes(2);
});

it("stops at the total and cancels an unfinished request when the tab unmounts", async () => {
  vi.mocked(axios.get).mockResolvedValue({
    data: { items: [{ id: 1 }], total: 1, offset: 0, limit: 5 },
  });
  await act(async () =>
    root.render(
      <QueryClientProvider client={client}>
        <UsageProbe />
      </QueryClientProvider>,
    ),
  );
  await vi.waitFor(() => expect(usage.data).toBeDefined());
  expect(usage.hasNextPage).toBe(false);
  await act(async () => {
    await usage.fetchNextPage();
  });
  expect(axios.get).toHaveBeenCalledTimes(1);
  await act(async () =>
    root.render(
      <QueryClientProvider client={client}>
        <span />
      </QueryClientProvider>,
    ),
  );
  client.clear();
  vi.mocked(axios.get).mockImplementation(() => new Promise(() => {}));
  await act(async () =>
    root.render(
      <QueryClientProvider client={client}>
        <UsageProbe />
      </QueryClientProvider>,
    ),
  );
  const signal = vi.mocked(axios.get).mock.calls[1][1]!.signal!;
  expect(signal.aborted).toBe(false);
  await act(async () =>
    root.render(
      <QueryClientProvider client={client}>
        <span />
      </QueryClientProvider>,
    ),
  );
  expect(signal.aborted).toBe(true);
});

it("reuses recent stats when reopening the tab", async () => {
  vi.mocked(axios.get).mockResolvedValue({
    data: { totals: { submissions: 1, spam: 0 } },
  });
  await act(async () =>
    root.render(
      <QueryClientProvider client={client}>
        <StatsProbe />
      </QueryClientProvider>,
    ),
  );
  await vi.waitFor(() =>
    expect(client.getQueryData(["forms", 2, "stats", 90])).toBeDefined(),
  );
  await act(async () =>
    root.render(
      <QueryClientProvider client={client}>
        <span />
      </QueryClientProvider>,
    ),
  );
  await act(async () =>
    root.render(
      <QueryClientProvider client={client}>
        <StatsProbe />
      </QueryClientProvider>,
    ),
  );
  expect(axios.get).toHaveBeenCalledTimes(1);
});
