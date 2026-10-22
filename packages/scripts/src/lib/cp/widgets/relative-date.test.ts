import { describe, expect, it } from "vitest";
import { formatRelativeDate } from "./relative-date";

const now = new Date("2026-10-20T14:00:00Z");
const relative = (value: string, locale = "en-US", zone = "America/Winnipeg") =>
  formatRelativeDate(value, locale, zone, now);
describe("widget relative dates", () => {
  it("shows whole minutes, hours, yesterday and older dates", () => {
    expect(relative("2026-10-20T13:40:00Z")).toBe("20 minutes ago");
    expect(relative("2026-10-20T11:00:00Z")).toBe("3 hours ago");
    expect(relative("2026-10-19T22:00:00Z")).toBe("yesterday");
    expect(relative("2026-10-13T14:00:00Z")).toBe("last week");
    expect(relative("2026-10-20T14:00:10Z")).toBe("now");
  });
  it("uses the site's calendar day rather than UTC midnight", () => {
    expect(relative("2026-10-20T02:00:00Z")).toBe("yesterday");
    expect(relative("2026-10-20T02:00:00Z", "en-US", "UTC")).toBe(
      "12 hours ago",
    );
  });
  it("localizes labels and preserves the original date for unsupported inputs", () => {
    expect(relative("2026-10-19T22:00:00Z", "fr_CA")).toBe("hier");
    expect(relative("invalid")).toBeNull();
    expect(
      relative("2026-10-19T22:00:00Z", "en-US", "invalid/zone"),
    ).toBeNull();
  });
});
