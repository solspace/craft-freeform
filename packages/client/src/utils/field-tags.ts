/** Serialize Tagify's structured mixed value without merging adjacent field chips. */
export const serializeFieldTags = (value: string): string => {
  const parts: { value: string; tag: boolean }[] = [];
  const append = (text: string, tag = false): void => {
    const clean = text.replace(/\u200B/g, "");
    if (clean) parts.push({ value: clean, tag });
  };

  let offset = 0;
  for (const match of value.matchAll(/\[\[(\{[\s\S]*?\})\]\]/g)) {
    append(value.slice(offset, match.index));
    try {
      const data = JSON.parse(match[1]);
      if (
        typeof data.value === "string" &&
        /^[a-zA-Z0-9_]+$/.test(data.value)
      ) {
        append(`field:${data.value}`, true);
      } else {
        append(match[0]);
      }
    } catch {
      // Preserve literal text that happens to resemble a Tagify token.
      append(match[0]);
    }
    offset = match.index + match[0].length;
  }
  append(value.slice(offset));

  let result = "";
  let previousTag = false;
  for (const part of parts) {
    // A handle must not swallow an adjacent chip or ordinary word. Preserve
    // punctuation/operators so calculation expressions retain their meaning.
    if (
      (part.tag && /[a-zA-Z0-9_]$/.test(result)) ||
      (previousTag && /^[a-zA-Z0-9_]/.test(part.value))
    ) {
      result += " ";
    }
    result += part.value;
    previousTag = part.tag;
  }
  return result.replace(/\s+/g, " ").trim();
};
