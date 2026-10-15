import axios from "axios";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  GenerationError,
  pendingGeneration,
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
});
afterEach(() => {
  vi.useRealTimers();
  sessionStorage.clear();
});

it("polls queued and running work and opens only the completed form", async () => {
  vi.mocked(axios.get)
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
  expect(axios.post).not.toHaveBeenCalled();
});

it("retries lost status reads without creating another generation", async () => {
  vi.mocked(axios.get)
    .mockRejectedValueOnce(new Error("network"))
    .mockResolvedValueOnce({ data: { status: "complete", formId: 18 } });
  const result = waitForGeneration(
    "request",
    new AbortController().signal,
    vi.fn(),
  );
  await vi.advanceTimersByTimeAsync(2000);
  expect(await result).toBe(18);
  expect(axios.post).not.toHaveBeenCalled();
});

it("leaves an interrupted request uncertain and never retries provider work", async () => {
  vi.mocked(axios.get).mockResolvedValue({ data: { status: "interrupted" } });
  const error = await waitForGeneration(
    "request",
    new AbortController().signal,
    vi.fn(),
  ).catch((error) => error);
  expect(error).toBeInstanceOf(GenerationError);
  expect(error.terminal).toBe(false);
  expect(error.message).toContain("Check the Forms list");
  expect(axios.post).not.toHaveBeenCalled();
});

it("filters HTML from a terminal generation error", async () => {
  vi.mocked(axios.get).mockResolvedValue({
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
  vi.mocked(axios.get).mockResolvedValue({ data: { status: "queued" } });
  const controller = new AbortController();
  const result = waitForGeneration("request", controller.signal, vi.fn()).catch(
    (error) => error,
  );
  await vi.advanceTimersByTimeAsync(0);
  controller.abort();
  expect((await result).name).toBe("AbortError");
  await vi.advanceTimersByTimeAsync(10_000);
  expect(axios.get).toHaveBeenCalledOnce();
});

it("retains only the opaque request identifier for reopening the dialog", () => {
  rememberGeneration("a".repeat(32));
  expect(pendingGeneration()).toBe("a".repeat(32));
  rememberGeneration(null);
  expect(pendingGeneration()).toBeNull();
});
