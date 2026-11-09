import palette from "../../../plugin/src/Library/Helpers/color-palette.json";
import translate from "./translations";

/** Keep the rich-text and email editors aligned with the shared color controls. */
export const editorColorMap = (): string[] =>
  palette.flatMap(({ value, label }) => [value, translate(label)]);
