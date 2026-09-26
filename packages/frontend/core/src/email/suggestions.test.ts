import { describe, expect, it } from "vitest";
import { getEmailSuggestion } from "./suggestions.js";

describe("email typo suggestions", () => {
  it.each([
    ["Jane+sales@gmial.com", "Jane+sales@gmail.com"],
    ["a@GMAIL.CON", "a@gmail.com"],
    ["a@hotmial.com", "a@hotmail.com"],
    ["a@outlok.com", "a@outlook.com"],
    ["a@yhaoo.com", "a@yahoo.com"],
    ["a@icloud.cmo", "a@icloud.com"],
    ["a@proton.comm", "a@proton.com"],
  ])("offers a domain-only correction for %s", (value, expected) => {
    expect(getEmailSuggestion(value)).toBe(expected);
  });
  it.each([
    "a@gmail.com",
    "a@GMAIL.COM",
    "a@company.com",
    "a@gmial.company",
    "a@yahoo.co.uk",
    "a@gmail.co",
    "a@__proto__",
    "",
    "a@@gmial.com",
    "a@gmial.com,b@hotmail.com",
    '"a b"@gmial.com',
    "é@gmial.com",
    "<script>@gmial.com",
    "a..b@gmial.com",
    ".a@gmial.com",
    `${"a".repeat(65)}@gmial.com`,
    `${"a".repeat(100000)}@gmial.com`,
  ])("does not guess or repair unsupported address %#", (value) => {
    expect(getEmailSuggestion(value)).toBeUndefined();
  });
});
