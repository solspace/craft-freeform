import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CardActivity } from "./card.activity";

const fixture = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@config/freeform/freeform.config", () => ({
  default: { metadata: { craft: { locale: "en_US" } } },
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));
vi.mock("@ff-client/contexts/site/site.context", () => ({
  useSiteContext: () => ({ current: { id: 1 } }),
}));
vi.mock("axios", () => ({ default: { get: fixture.get } }));
let host: HTMLDivElement, root: Root, client: QueryClient;
const flush = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
};
const render = async (id: number) => {
  await act(async () =>
    root.render(
      <QueryClientProvider client={client}>
        <CardActivity id={id} />
      </QueryClientProvider>,
    ),
  );
  await flush();
};
beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  fixture.get.mockReset();
  client = new QueryClient();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  client.clear();
  host.remove();
});
it("shows an empty state and can retry failed activity requests", async () => {
  fixture.get
    .mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValueOnce({ data: { submissions: [] } });
  await render(1);
  expect(host.textContent).toContain("Could not load activity.");
  await act(async () =>
    host.querySelector<HTMLButtonElement>("button").click(),
  );
  await flush();
  expect(host.textContent).toContain("No submissions in this period.");
  expect(fixture.get).toHaveBeenCalledTimes(2);
});
it("does not show another form's activity while its request is delayed or after it fails", async () => {
  fixture.get.mockResolvedValueOnce({
    data: {
      submissions: [
        {
          id: 12,
          title: "Anna — Website enquiry",
          createdAt: "2026-10-19T12:00:00+00:00",
          url: "/admin/freeform/submissions/12",
          status: { name: "Reviewed", color: "green" },
        },
      ],
    },
  });
  await render(1);
  expect(host.querySelector("time").dateTime).toBe("2026-10-19T12:00:00+00:00");
  expect(host.querySelector("a").getAttribute("href")).toBe(
    "/admin/freeform/submissions/12",
  );
  expect(host.querySelector("a").textContent).toBe("Anna — Website enquiry");
  expect(host.querySelector(".submission-status").getAttribute("title")).toBe(
    "Reviewed",
  );
  expect(
    host.querySelector(".submission-status").classList.contains("green"),
  ).toBe(true);
  let reject: (error: Error) => void;
  fixture.get.mockImplementationOnce(
    () =>
      new Promise((_resolve, no) => {
        reject = no;
      }),
  );
  await render(2);
  expect(host.querySelector("time")).toBeNull();
  expect(host.textContent).toContain("Loading activity…");
  await act(async () => reject(new Error("offline")));
  await flush();
  expect(host.querySelector("time")).toBeNull();
  expect(host.textContent).toContain("Could not load activity.");
});
