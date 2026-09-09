import type { ReactFieldRendererProps } from "../../types.js";

export function HtmlFieldRenderer(props: ReactFieldRendererProps) {
  const contentClass =
    props.classNames.content ?? props.classNames.input ?? "ff-field__content";
  const html = props.field.content?.rendered?.html?.trim();

  if (props.allowRawHtml && html) {
    return (
      <div
        className={contentClass}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  // Empty rich-text / html with no renderable content — don't invent a second row.
  if (!props.field.instructions) {
    return null;
  }

  return (
    <div className={contentClass} role="note">
      {props.field.instructions}
    </div>
  );
}
