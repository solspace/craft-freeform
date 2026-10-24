import { describe, expect, it } from "vitest";
import {
  buttonLinkPresentation,
  contentVideoUrl,
  safeContentUrl,
} from "./content-presentation";

describe("content destinations", () => {
  it.each([
    "https://example.test/next",
    "/contact",
    "../contact",
    "#details",
    "mailto:hello@example.test",
    "tel:+15550101234",
  ])("keeps a usable destination: %s", (url) =>
    expect(safeContentUrl(url)).toBe(url),
  );
  it.each([
    "javascript:alert(1)",
    "data:text/html,x",
    "//example.test",
    "https:example.test",
    "https://",
    "mailTo:",
    "java\nscript:alert(1)",
    "/\\example.test",
  ])("rejects unsafe or malformed destinations: %s", (url) =>
    expect(safeContentUrl(url)).toBe("#"),
  );
  it("limits appearance values while preserving an outline link and alignment", () => {
    const presentation = buttonLinkPresentation({
      url: "/next",
      appearance: "outline",
      color: "red;position:fixed",
      size: "large",
      alignment: "right",
    });
    expect(presentation.safeLink).toBe("/next");
    expect(presentation.linkAlignment).toBe("right");
    expect(presentation.buttonStyles).toContain("color:#1d4ed8");
    expect(presentation.buttonStyles).toContain("background:transparent");
    expect(presentation.buttonStyles).toContain("font-size:18px");
    expect(presentation.buttonStyles).not.toContain("position:fixed");
  });
});
describe("video destinations", () => {
  it.each([
    [
      "https://youtu.be/dQw4w9WgXcQ",
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    ],
    [
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10",
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    ],
    [
      "https://youtube.com/shorts/dQw4w9WgXcQ",
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    ],
    [
      "https://vimeo.com/123456789/abcdef1234",
      "https://player.vimeo.com/video/123456789?h=abcdef1234",
    ],
    [
      "https://player.vimeo.com/video/123456789?h=abcdef1234",
      "https://player.vimeo.com/video/123456789?h=abcdef1234",
    ],
  ])("converts a provider URL: %s", (url, expected) =>
    expect(contentVideoUrl(url)).toBe(expected),
  );
  it.each([
    "https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v[]=dQw4w9WgXcQ",
    "https://example.test/embed/x",
    "javascript:alert(1)",
    "http://youtu.be/dQw4w9WgXcQ",
    "https://user@youtu.be/dQw4w9WgXcQ",
    "https://youtu.be:8443/dQw4w9WgXcQ",
  ])("rejects an unsupported video URL: %s", (url) =>
    expect(contentVideoUrl(url)).toBeUndefined(),
  );
});
