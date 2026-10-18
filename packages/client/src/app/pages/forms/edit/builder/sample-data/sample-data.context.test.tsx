import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import {
  SampleDataProvider,
  useSampleData,
  useSamplePreview,
} from "./sample-data.context";

vi.mock("axios", () => ({ default: { get: vi.fn() } }));
vi.mock("@ff-client/contexts/site/site.context", () => ({
  useSiteContext: () => ({ current: { id: 1 } }),
}));

it("loads one shared catalog for 145 previews, keeps samples stable, and refreshes only on request", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const request = vi.mocked(axios.get).mockResolvedValue({
    data: [{ id: "firstName", label: "First name", value: "Alex" }],
  });
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const Preview = ({ value }: { value: string }) => {
    const sample = useSamplePreview(value);
    return <span>{sample?.value ?? value}</span>;
  };
  const Refresh = () => {
    const { refresh } = useSampleData();
    return (
      <button type="button" onClick={refresh}>
        Refresh
      </button>
    );
  };
  const view = (value: string) => (
    <QueryClientProvider client={client}>
      <SampleDataProvider>
        {Array.from({ length: 145 }, (_, i) => (
          <Preview key={i} value={value} />
        ))}
        <Refresh />
      </SampleDataProvider>
    </QueryClientProvider>
  );
  try {
    await act(async () => root.render(view("Regular default")));
    expect(request).not.toHaveBeenCalled();
    await act(async () => root.render(view("{{ faker.firstName }}")));
    await vi.waitFor(() =>
      expect(client.getQueryData(["sample-data", 1])).toBeDefined(),
    );
    await act(async () => root.render(view("{{ faker.firstName }}")));
    expect(request).toHaveBeenCalledTimes(1);
    expect(host.querySelectorAll("span")[144].textContent).toBe("Alex");
    await act(async () => root.render(view("{{ faker.firstName|raw }}")));
    expect(request).toHaveBeenCalledTimes(1);
    expect(host.querySelector("span")?.textContent).toBe("Alex");
    await act(async () => root.render(view("{{ faker.firstName }}123")));
    expect(host.querySelector("span")?.textContent).toBe("Alex123");
    expect(request).toHaveBeenCalledTimes(1);
    await act(async () => root.render(view("{{ faker.file }}")));
    expect(host.querySelector("span")?.textContent).toBe("{{ faker.file }}");
    expect(request).toHaveBeenCalledTimes(1);
    await act(async () => host.querySelector("button")?.click());
    expect(request).toHaveBeenCalledTimes(2);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    client.clear();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  }
});
