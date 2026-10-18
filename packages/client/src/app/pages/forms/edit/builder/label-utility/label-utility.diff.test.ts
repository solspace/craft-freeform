import { describe, expect, it } from "vitest";
import { diffLabel } from "./label-utility.diff";

const changedText = (parts: ReturnType<typeof diffLabel>["current"]) =>
  parts.filter((part) => part.changed).map((part) => part.text);

describe("label preview highlights", () => {
  it("highlights only replaced characters, keeping unchanged text between edits", () => {
    const diff = diffLabel("Insured and Co-Insured:", "Ansured and Co-Ansured");
    expect(changedText(diff.current)).toEqual(["I", "I", ":"]);
    expect(changedText(diff.next)).toEqual(["A", "A"]);
  });

  it.each([
    ["Name", "Name:"],
    ["Name:", "Name"],
    [" first   name ", "First name"],
    ["👩‍💻 Prénom", "👩‍💻 prénom"],
    ["", "新しい名前"],
    ["Delete", ""],
    ["Unchanged", "Unchanged"],
    ["a".repeat(300), "b".repeat(300)],
  ])("preserves complete labels for %j → %j", (before, after) => {
    const diff = diffLabel(before, after);
    expect(diff.current.map((part) => part.text).join("")).toBe(before);
    expect(diff.next.map((part) => part.text).join("")).toBe(after);
    expect(
      diff.current
        .filter((part) => !part.changed)
        .map((part) => part.text)
        .join(""),
    ).toBe(
      diff.next
        .filter((part) => !part.changed)
        .map((part) => part.text)
        .join(""),
    );
  });
});
