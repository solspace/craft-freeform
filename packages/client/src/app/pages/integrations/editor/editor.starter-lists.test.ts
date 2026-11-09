import { describe, expect, it } from "vitest";
import { appendStarterEntries, starterList } from "./editor.starter-lists";

describe("starter list insertion", () => {
  it("appends missing entries without rewriting existing text or line endings", () => {
    const before = "  custom rule  \r\nExisting Rule\r\n";
    const result = appendStarterEntries(before, {
      entries: ["existing rule", "new rule", "new rule"],
      description: "",
    });
    expect(result.value).toBe(`${before}new rule`);
    expect(result.added).toBe(1);
    expect(
      appendStarterEntries(result.value, {
        entries: ["existing rule", "new rule"],
        description: "",
      }).value,
    ).toBe(result.value);
  });
  it("keeps tracking parameters case-sensitive and includes ten standard names", () => {
    const preset = starterList(
      "Solspace\\Freeform\\Integrations\\Single\\UrlParameterTracking\\UrlParameterTracking",
      "defaultParameters",
    )!;
    expect(preset.entries).toHaveLength(10);
    const result = appendStarterEntries("UTM_SOURCE\ncustom_campaign", preset);
    expect(
      result.value.startsWith("UTM_SOURCE\ncustom_campaign\nutm_source"),
    ).toBe(true);
    expect(result.value).toContain("fbclid");
    expect(appendStarterEntries(result.value, preset).added).toBe(0);
  });
  it("matches gibberish allowance normalization without changing existing entries", () => {
    const preset = starterList(
      "Solspace\\Freeform\\Integrations\\SpamBlocking\\Gibberish\\BlockGibberish",
      "defaultAllowedTerms",
    )!;
    const result = appendStarterEntries("http-s\nMy own term", preset);
    expect(result.value.startsWith("http-s\nMy own term")).toBe(true);
    expect(result.value.split("\n")).not.toContain("HTTPS");
  });
  it("includes varied keyword patterns without blocking regular email providers", () => {
    const keywords = starterList(
      "Solspace\\Freeform\\Integrations\\SpamBlocking\\Keywords\\BlockKeywords",
      "defaultKeywords",
    )!;
    expect(keywords.entries).toHaveLength(100);
    expect(keywords.entries).toContain("viagr*");
    expect(keywords.entries).toContain('"buy backlinks"');
    expect(keywords.entries).toContain("cialis");
    expect(new Set(keywords.entries).size).toBe(100);
    const emails = starterList(
      "Solspace\\Freeform\\Integrations\\SpamBlocking\\Emails\\BlockEmailAddresses",
      "defaultEmails",
    )!;
    expect(emails.entries).toEqual(
      expect.arrayContaining([
        "*@*.ru",
        "*@*.su",
        "*@*.xyz",
        "*@*.top",
        "*@dropmail.me",
        "*@10mail.org",
      ]),
    );
    expect(
      emails.entries.some((entry) => /gmail|hotmail|yahoo|outlook/.test(entry)),
    ).toBe(false);
  });
  it("only offers presets on their intended global fields", () => {
    expect(
      starterList(
        "Solspace\\Freeform\\Integrations\\SpamBlocking\\Keywords\\BlockKeywords",
        "keywords",
      ),
    ).toBeUndefined();
    expect(starterList("OtherIntegration", "defaultKeywords")).toBeUndefined();
  });
});
