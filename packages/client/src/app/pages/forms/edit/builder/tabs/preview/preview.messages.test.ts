import { describe, expect, it } from "vitest";
import { readPreviewMessage } from "./preview.messages";

describe("preview message boundary", () => {
  const channel = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  const message = (values: unknown, action = "values") =>
    new MessageEvent("message", {
      source: window,
      origin: "null",
      data: { type: "freeform-preview", channel, action, values },
    });
  it("accepts bounded scalar and multiple-choice answers", () => {
    expect(
      readPreviewMessage(
        message({ name: "Test", choices: ["one", "two"] }),
        window,
        channel,
      )?.values,
    ).toEqual({ name: "Test", choices: ["one", "two"] });
  });
  it.each([
    null,
    [],
    new Date(),
    new Map(),
    { name: Array(2) },
    { name: {} },
    { name: 1 },
    { name: [null] },
    { name: "x".repeat(10001) },
    { constructor: "bad" },
    { name: Array(101).fill("one") },
    Object.fromEntries(
      Array.from({ length: 501 }, (_, i) => [`field${i}`, "one"]),
    ),
    Object.fromEntries(
      Array.from({ length: 20 }, (_, i) => [`field${i}`, "x".repeat(9000)]),
    ),
  ])("rejects malformed or oversized answer data", (values) => {
    expect(
      readPreviewMessage(message(values), window, channel),
    ).toBeUndefined();
  });
  it("rejects arbitrary actions and stale channels", () => {
    expect(
      readPreviewMessage(message({}, "fetch"), window, channel),
    ).toBeUndefined();
    expect(readPreviewMessage(message({}), window, "old")).toBeUndefined();
    expect(readPreviewMessage(message({}), null, channel)).toBeUndefined();
  });
});
