import { getSummaryEntries } from "@solspace/freeform-core";
import type { ReactFieldRendererProps } from "../../types.js";

export function SummaryFieldRenderer({
  field,
  form,
  classNames,
}: ReactFieldRendererProps) {
  const entries = getSummaryEntries(field, form);
  return (
    <dl className={classNames.content ?? "ff-field__content"}>
      {entries.map((entry) => (
        <div key={entry.handle} data-summary-field={entry.handle}>
          <dt>{entry.label}</dt>
          <dd style={{ whiteSpace: "pre-wrap" }}>{entry.text}</dd>
        </div>
      ))}
    </dl>
  );
}
