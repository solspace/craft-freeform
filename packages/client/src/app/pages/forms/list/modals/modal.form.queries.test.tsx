import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { useFetchFormModalType } from "./modal.form.queries";

vi.mock("axios", () => ({ default: { get: vi.fn() } }));
vi.mock("@config/freeform/freeform.config", () => ({
  default: {},
  Edition: { Express: "express" },
}));

function Metadata() {
  const { data } = useFetchFormModalType();
  return <div>{JSON.stringify(data)}</div>;
}

it("fetches current defaults and locks when Quick setup is reopened", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.mocked(axios.get)
    .mockResolvedValueOnce({
      data: [{ handle: "type", value: "regular", disabled: false }],
    })
    .mockResolvedValueOnce({
      data: [{ handle: "type", value: "survey", disabled: true }],
    });
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const render = (open: boolean) =>
    act(async () =>
      root.render(
        <QueryClientProvider client={client}>
          {open && <Metadata />}
        </QueryClientProvider>,
      ),
    );

  try {
    await render(true);
    await act(async () => {
      await vi.waitFor(() => expect(host.textContent).toContain('"regular"'));
    });
    await render(false);
    await act(async () => {
      await vi.waitFor(() =>
        expect(client.getQueryCache().getAll()).toHaveLength(0),
      );
    });
    await render(true);
    await act(async () => {
      await vi.waitFor(() => expect(host.textContent).toContain('"survey"'));
    });
    expect(host.textContent).toContain('"disabled":true');
    expect(axios.get).toHaveBeenCalledTimes(2);
  } finally {
    act(() => root.unmount());
    host.remove();
    client.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  }
});
