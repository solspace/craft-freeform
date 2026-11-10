import { describe, expect, it } from "vitest";
import { formatRelativeDate } from "./relative-date";

const now = new Date("2026-10-20T14:00:00Z");
const relative = (value: string, locale = "en-US", zone = "America/Winnipeg") =>
  formatRelativeDate(value, locale, zone, now);
describe("widget relative dates", () => {
  it("uses compact labels for minutes, hours, days and older dates", () => {
    expect(relative("2026-10-20T13:40:00Z")).toBe("20m ago");
    expect(relative("2026-10-20T11:00:00Z")).toBe("3h ago");
    expect(relative("2026-10-19T22:00:00Z")).toBe("1d ago");
    expect(relative("2026-10-13T14:00:00Z")).toBe("1w ago");
    expect(relative("2026-10-20T14:00:10Z")).toBe("now");
  });
  it("keeps single and plural unit labels compact, including future dates", () => {
    expect(relative("2026-10-20T13:59:00Z")).toBe("1m ago");
    expect(relative("2026-10-20T13:00:00Z")).toBe("1h ago");
    expect(relative("2026-10-17T14:00:00Z")).toBe("3d ago");
    expect(relative("2026-10-20T16:00:00Z")).toBe("in 2h");
  });
  it("uses the site's calendar day rather than UTC midnight", () => {
    expect(relative("2026-10-20T02:00:00Z")).toBe("1d ago");
    expect(relative("2026-10-20T02:00:00Z", "en-US", "UTC")).toBe("12h ago");
  });
  it("localizes labels and preserves the original date for unsupported inputs", () => {
    expect(relative("2026-10-19T22:00:00Z", "fr_CA")).toBe("-1 j");
    expect(relative("invalid")).toBeNull();
    expect(
      relative("2026-10-19T22:00:00Z", "en-US", "invalid/zone"),
    ).toBeNull();
  });
});
