import escapeHtml from "lodash/escape";
import {
  parseSampleExpression,
  type SampleGenerator,
  sampleParts,
} from "./sample-data";

export const sampleTokenDelimiters: [string, string] = [
  "[[FREEFORM_SAMPLE:",
  ":FREEFORM_SAMPLE]]",
];
const tagPattern = /\[\[FREEFORM_SAMPLE:(\{[\s\S]*?\}):FREEFORM_SAMPLE\]\]/g;

export const encodeSampleTokens = (
  value: string,
  byId: ReadonlyMap<string, SampleGenerator>,
): string =>
  sampleParts(value)
    .map((part) => {
      const generator = part.type === "sample" ? byId.get(part.id) : undefined;
      return generator
        ? sampleTokenDelimiters[0] +
            JSON.stringify({
              value: generator.id,
              label: generator.label,
              expression: part.value,
            }) +
            sampleTokenDelimiters[1]
        : escapeHtml(part.value);
    })
    .join("");

export const serializeSampleTokens = (value: string): string =>
  value
    .replace(tagPattern, (match, json: string) => {
      try {
        const data = JSON.parse(json);
        return typeof data.expression === "string" &&
          parseSampleExpression(data.expression) === data.value
          ? data.expression
          : match;
      } catch {
        return match;
      }
    })
    .replace(/\u200B/g, "")
    // Tagify keeps one trailing BR for the caret; it isn't part of the value.
    .replace(/\r\n$/, "")
    .replace(/\r\n/g, "\n");

export const hasUntokenizedSamples = (
  value: string,
  byId: ReadonlyMap<string, SampleGenerator>,
): boolean =>
  sampleParts(value.replace(tagPattern, "")).some(
    (part) => part.type === "sample" && byId.has(part.id),
  );
