import { isEnvTrue } from "@components/form-controls/control-types/bool-env/bool-env.operations";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useResolvedBoolean } from "./autosuggest";

vi.mock("axios", () => ({ default: { get: vi.fn() } }));
let root: Root;
let container: HTMLDivElement;
let client: QueryClient;
function mount(value: string) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(value);
}
function Resolved({ value }: { value: string }) {
  const result = useResolvedBoolean(value);
  return <span>{result === undefined ? "unknown" : String(result)}</span>;
}
function render(value: string) {
  act(() =>
    root.render(
      <QueryClientProvider client={client}>
        <Resolved value={value} />
      </QueryClientProvider>,
    ),
  );
}
afterEach(() => {
  if (root) act(() => root.unmount());
  container?.remove();
  client?.clear();
  vi.resetAllMocks();
});

describe("boolean environment resolution", () => {
  it("normalizes false strings rather than treating them as truthy", () => {
    for (const value of [
      false,
      "false",
      "FALSE",
      "no",
      "off",
      "0",
      "",
      undefined,
    ])
      expect(isEnvTrue(value)).toBe(false);
    for (const value of [true, "true", "TRUE", "yes", "on", "1", " yes "])
      expect(isEnvTrue(value)).toBe(true);
  });
  it("uses literal values without requesting the server", () => {
    mount("false");
    expect(container.textContent).toBe("false");
    render("yes");
    expect(container.textContent).toBe("true");
    expect(axios.get).not.toHaveBeenCalled();
  });
  it("uses the server's boolean for an environment variable", async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: false });
    mount("$QA_CUSTOM_LOGIN");
    await vi.waitFor(() => expect(container.textContent).toBe("false"));
    expect(axios.get).toHaveBeenCalledWith(
      "/api/autosuggest/boolean-env",
      expect.objectContaining({ params: { value: "$QA_CUSTOM_LOGIN" } }),
    );
  });
  it("keeps failed lookups unknown rather than assuming a value", async () => {
    vi.mocked(axios.get).mockRejectedValue(new Error("unavailable"));
    mount("$QA_CUSTOM_LOGIN");
    await vi.waitFor(() =>
      expect(
        client.getQueryState(["autosuggest", "boolean-env", "$QA_CUSTOM_LOGIN"])
          ?.status,
      ).toBe("error"),
    );
    expect(container.textContent).toBe("unknown");
  });
  it("ignores a delayed result after selecting another variable", async () => {
    let finishFirst: (value: unknown) => void = () => {};
    vi.mocked(axios.get)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finishFirst = resolve;
          }),
      )
      .mockResolvedValueOnce({ data: true });
    mount("$QA_FIRST");
    render("$QA_SECOND");
    await vi.waitFor(() => expect(container.textContent).toBe("true"));
    await act(async () => {
      finishFirst({ data: false });
    });
    expect(container.textContent).toBe("true");
  });
});
