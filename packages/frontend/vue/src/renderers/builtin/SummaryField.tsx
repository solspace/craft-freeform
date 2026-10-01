// @ts-nocheck
import { getSummaryEntries } from "@solspace/freeform-core";
import type { VueFieldRendererProps } from "../../types.js";

export function SummaryFieldRenderer({
  field,
  form,
  classNames,
}: VueFieldRendererProps) {
  const entries = getSummaryEntries(field, form);
  return (
    <dl class={classNames.content ?? "ff-field__content"}>
      {entries.map((entry) => (
        <div key={entry.handle} data-summary-field={entry.handle}>
          <dt>{entry.label}</dt>
          <dd style={{ whiteSpace: "pre-wrap" }}>{entry.text}</dd>
        </div>
      ))}
    </dl>
  );
}
