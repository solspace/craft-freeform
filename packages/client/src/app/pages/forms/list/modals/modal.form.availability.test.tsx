import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useFormCreationAvailability } from "./modal.form.queries";

const fixture = vi.hoisted(() => ({
  config: { editions: { edition: "express" } },
}));
vi.mock("@config/freeform/freeform.config", () => ({
  default: fixture.config,
  Edition: { Express: "express" },
}));
vi.mock("axios", () => ({ default: { get: vi.fn() } }));

let host: HTMLDivElement;
let root: Root;
let client: QueryClient;
function Availability() {
  const { data } = useFormCreationAvailability();
  return <span>{data ? String(data.canCreate) : "Loading"}</span>;
}
const render = async (open = true) => {
  await act(async () => {
    root.render(
      <QueryClientProvider client={client}>
        {open && <Availability />}
      </QueryClientProvider>,
    );
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
};
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.clearAllMocks();
  fixture.config.editions.edition = "express";
  client = new QueryClient();
  host = document.createElement("div");
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  client.clear();
  vi.unstubAllGlobals();
});

it("checks the global limit again on reopening after a form is deleted", async () => {
  vi.mocked(axios.get).mockResolvedValueOnce({ data: { canCreate: false } });
  await render();
  expect(host.textContent).toBe("false");
  expect(axios.get).toHaveBeenCalledWith("/api/forms/creation-availability");

  await render(false);
  vi.mocked(axios.get).mockResolvedValueOnce({ data: { canCreate: true } });
  await render();
  expect(axios.get).toHaveBeenCalledTimes(2);
  expect(host.textContent).toBe("true");
});

it.each(["lite", "pro"])("skips the limit request for %s", async (edition) => {
  fixture.config.editions.edition = edition;
  await render();
  expect(axios.get).not.toHaveBeenCalled();
});
