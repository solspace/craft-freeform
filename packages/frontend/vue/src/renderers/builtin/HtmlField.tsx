// @ts-nocheck
import type { VueFieldRendererProps } from "../../types.js";

export function HtmlFieldRenderer(props: VueFieldRendererProps) {
  const contentClass =
    props.classNames.content ?? props.classNames.input ?? "ff-field__content";
  const html = props.field.content?.rendered?.html?.trim();

  if (props.allowRawHtml && html) {
    return <div class={contentClass} innerHTML={html} />;
  }

  // Empty rich-text / html with no renderable content — don't invent a second row.
  if (!props.field.instructions) {
    return null;
  }

  return (
    <div class={contentClass} role="note">
      {props.field.instructions}
    </div>
  );
}
