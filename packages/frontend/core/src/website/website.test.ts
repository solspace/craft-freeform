import { describe, expect, it } from "vitest";
import { normalizeWebsite } from "./website.js";

describe("normalizeWebsite", () => {
  it.each([
    ["example.com", "https://example.com"],
    ["www.example.com", "https://www.example.com"],
    ["blog.example.co.uk", "https://blog.example.co.uk"],
    [
      "example.com/Contact?ref=AbC&next=%2FHome#Team",
      "https://example.com/Contact?ref=AbC&next=%2FHome#Team",
    ],
    ["example.com?ref=AbC", "https://example.com?ref=AbC"],
    ["example.com#Team", "https://example.com#Team"],
    ["//example.com/Contact", "https://example.com/Contact"],
    [" \tExample.COM/Contact\n", "https://Example.COM/Contact"],
    ["\u00a0example.com\u00a0", "https://example.com"],
    [" http://example.com/Contact ", "http://example.com/Contact"],
    [
      "HTTPS://Example.COM/Contact?ref=AbC#Team",
      "HTTPS://Example.COM/Contact?ref=AbC#Team",
    ],
    ["ftp://example.com/file", "ftp://example.com/file"],
    ["sftp://example.com/file", "sftp://example.com/file"],
    ["ssh://example.com/file", "ssh://example.com/file"],
    ["", ""],
    [" \t\n", ""],
    ["not a website", "not a website"],
    ["name@example.com", "name@example.com"],
    ["mailto:name@example.com", "mailto:name@example.com"],
    ["javascript:alert(1)", "javascript:alert(1)"],
    ["/relative/path", "/relative/path"],
    ["example..com", "example..com"],
    ["-example.com", "-example.com"],
    ["https:example.com", "https:example.com"],
  ])(
    "completes %j as %j without changing meaningful URL content",
    (input, expected) => {
      expect(normalizeWebsite(input)).toBe(expected);
      expect(normalizeWebsite(expected)).toBe(expected);
    },
  );
});
