import axios from "axios";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  GenerationError,
  pendingGeneration,
  pendingGenerationKey,
  pendingGenerationStartedAt,
  rememberGeneration,
  waitForGeneration,
} from "./modal.form.ai-generation";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    isAxiosError: (error: { isAxiosError?: boolean }) =>
      error?.isAxiosError === true,
  },
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));
beforeEach(() => {
  vi.useFakeTimers();
  vi.resetAllMocks();
  sessionStorage.clear();
  localStorage.clear();
});
afterEach(() => {
  vi.useRealTimers();
  sessionStorage.clear();
  localStorage.clear();
});

it("polls queued and running work and opens only the completed form", async () => {
  vi.mocked(axios.post)
    .mockResolvedValueOnce({ data: { status: "queued" } })
    .mockResolvedValueOnce({ data: { status: "running" } })
    .mockResolvedValueOnce({ data: { status: "complete", formId: 17 } });
  const status = vi.fn();
  const result = waitForGeneration(
    "request",
    new AbortController().signal,
    status,
  );
  await vi.advanceTimersByTimeAsync(4000);
  expect(await result).toBe(17);
  expect(status.mock.calls.map(([value]) => value)).toEqual([
    "queued",
    "running",
  ]);
  expect(axios.get).not.toHaveBeenCalled();
  expect(
    vi
      .mocked(axios.post)
      .mock.calls.every(([url]) =>
        String(url).startsWith("/api/forms/ai-generation-progress/"),
      ),
  ).toBe(true);
});

it("retries lost status reads without creating another generation", async () => {
  vi.mocked(axios.post)
    .mockRejectedValueOnce(new Error("network"))
    .mockResolvedValueOnce({ data: { status: "complete", formId: 18 } });
  const result = waitForGeneration(
    "request",
    new AbortController().signal,
    vi.fn(),
  );
  await vi.advanceTimersByTimeAsync(2000);
  expect(await result).toBe(18);
  expect(axios.get).not.toHaveBeenCalled();
  expect(
    vi
      .mocked(axios.post)
      .mock.calls.every(([url]) =>
        String(url).startsWith("/api/forms/ai-generation-progress/"),
      ),
  ).toBe(true);
});

it("leaves an interrupted request uncertain and never retries provider work", async () => {
  vi.mocked(axios.post).mockResolvedValue({ data: { status: "interrupted" } });
  const error = await waitForGeneration(
    "request",
    new AbortController().signal,
    vi.fn(),
  ).catch((error) => error);
  expect(error).toBeInstanceOf(GenerationError);
  expect(error.terminal).toBe(false);
  expect(error.message).toContain("Forms list");
  expect(axios.get).not.toHaveBeenCalled();
  expect(
    vi
      .mocked(axios.post)
      .mock.calls.every(([url]) =>
        String(url).startsWith("/api/forms/ai-generation-progress/"),
      ),
  ).toBe(true);
});

it("filters HTML from a terminal generation error", async () => {
  vi.mocked(axios.post).mockResolvedValue({
    data: { status: "failed", message: "<html>nginx details</html>" },
  });
  const error = await waitForGeneration(
    "request",
    new AbortController().signal,
    vi.fn(),
  ).catch((error) => error);
  expect(error.terminal).toBe(true);
  expect(error.message).not.toContain("nginx");
  expect(error.message).toContain("Form generation could not complete");
});

it("stops polling when the dialog closes", async () => {
  vi.mocked(axios.post).mockResolvedValue({ data: { status: "queued" } });
  const controller = new AbortController();
  const result = waitForGeneration("request", controller.signal, vi.fn()).catch(
    (error) => error,
  );
  await vi.advanceTimersByTimeAsync(0);
  controller.abort();
  expect((await result).name).toBe("AbortError");
  await vi.advanceTimersByTimeAsync(10_000);
  expect(axios.post).toHaveBeenCalledOnce();
});

it("retains the opaque request identifier and its start time for reopening", () => {
  rememberGeneration("a".repeat(32));
  expect(pendingGeneration()).toBe("a".repeat(32));
  rememberGeneration(null);
  expect(pendingGeneration()).toBeNull();
});

it("keeps the opaque ID across dialog and browser sessions", () => {
  rememberGeneration("b".repeat(32));
  expect(localStorage.getItem("freeform.pending-ai-generation")).toBe(
    "b".repeat(32),
  );
  sessionStorage.clear();
  expect(pendingGeneration()).toBe("b".repeat(32));
  rememberGeneration(null);
  expect(localStorage.getItem("freeform.pending-ai-generation")).toBeNull();
});

it("preserves an original timestamp tied to its request and clears both together", () => {
  const id = "c".repeat(32);
  const startedAt = Date.now() - 90000;
  rememberGeneration(id, startedAt);
  expect(pendingGenerationStartedAt(id)).toBe(startedAt);
  expect(pendingGenerationStartedAt("d".repeat(32))).toBeNull();
  rememberGeneration(null);
  expect(pendingGenerationStartedAt(id)).toBeNull();
});
it("ignores corrupt or future timestamps and supports an old ID without one", () => {
  const id = "c".repeat(32);
  const key = `${pendingGenerationKey}.started-at`;
  localStorage.setItem(pendingGenerationKey, id);
  expect(pendingGenerationStartedAt(id)).toBeNull();
  localStorage.setItem(key, "invalid JSON");
  expect(pendingGenerationStartedAt(id)).toBeNull();
  rememberGeneration(id, Date.now() + 10000);
  expect(pendingGenerationStartedAt(id)).toBeNull();
  expect(pendingGeneration()).toBe(id);
});
