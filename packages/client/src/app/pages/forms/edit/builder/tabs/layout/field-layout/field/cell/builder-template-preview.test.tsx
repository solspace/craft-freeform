import { configureStore } from "@reduxjs/toolkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { expect, it, vi } from "vitest";
import { BuilderTemplatePreview } from "./builder-template-preview";

vi.mock("@ff-client/contexts/site/site.context", () => ({
  useSiteContext: () => ({ current: { handle: "english" } }),
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (value: string) => value,
}));
vi.mock("axios", () => ({ default: { post: vi.fn() } }));

it("renders in a sandbox and keeps the builder usable after template and network errors", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const post = vi.mocked(axios.post);
  post.mockResolvedValueOnce({ data: { html: "<h2>Sidebar content</h2>" } });
  const store = configureStore({ reducer: { form: () => ({ id: 15 }) } });
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const view = (template: string) => (
    <Provider store={store}>
      <QueryClientProvider client={client}>
        <BuilderTemplatePreview fieldUid="field-1" template={template} />
      </QueryClientProvider>
    </Provider>
  );

  try {
    await act(async () => root.render(view("sample-sidebar.twig")));
    await act(async () => new Promise((resolve) => setTimeout(resolve, 25)));
    const frame = host.querySelector("iframe");
    expect(frame?.getAttribute("sandbox")).toBe("allow-same-origin");
    expect(frame?.getAttribute("srcdoc")).toContain("Sidebar content");
    expect(post).toHaveBeenCalledWith(
      "/api/forms/15/builder-template-preview",
      { template: "sample-sidebar.twig", fieldUid: "field-1" },
      expect.objectContaining({ params: { site: "english" } }),
    );

    post.mockResolvedValueOnce({ data: { html: "", error: "Twig failed" } });
    await act(async () => root.render(view("broken.twig")));
    await act(async () => new Promise((resolve) => setTimeout(resolve, 25)));
    expect(host.textContent).toContain("Twig failed");
    expect(host.querySelector("iframe")).toBeNull();

    post.mockResolvedValueOnce({
      data: { html: "", errorCode: "missing-template" },
    });
    await act(async () => root.render(view("missing.twig")));
    await act(async () => new Promise((resolve) => setTimeout(resolve, 25)));
    expect(host.textContent).toContain("Template not found");
    expect(host.textContent).toContain("missing.twig");
    expect(host.textContent).toContain("choose another template");
    expect(host.querySelector('[role="alert"] svg')).not.toBeNull();

    post.mockRejectedValueOnce(new Error("Network unavailable"));
    await act(async () => root.render(view("offline.twig")));
    await act(async () => new Promise((resolve) => setTimeout(resolve, 25)));
    expect(host.textContent).toContain("Template preview unavailable");
  } finally {
    await act(async () => root.unmount());
    host.remove();
    client.clear();
    post.mockReset();
    vi.unstubAllGlobals();
  }
});
