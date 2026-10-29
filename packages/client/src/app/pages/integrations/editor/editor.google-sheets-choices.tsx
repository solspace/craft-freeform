import { ChoiceCards } from "@components/elements/choice-cards/choice-cards";
import { Control } from "@components/form-controls/control";
import type { ControlType } from "@components/form-controls/types";
import { type Property, PropertyType } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";

function RowIcon({ insert }: { insert: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M3 15h18" />
      {insert ? <path d="M12 10.5v3m-1.5-1.5h3" /> : <path d="m9 12 2 2 4-4" />}
    </svg>
  );
}

export function GoogleSheetsChoices({
  property,
  value,
  errors,
  context,
  updateValue,
}: ControlType<Property>) {
  if (property.type !== PropertyType.ButtonGroup) return null;
  return (
    <Control property={property} errors={errors} context={context}>
      <ChoiceCards
        label={property.label ?? property.handle}
        value={typeof value === "string" ? value : ""}
        disabled={property.disabled}
        onChange={updateValue}
        options={property.options.flatMap((option) => {
          if (!("value" in option)) return [];
          const insert = option.value === "INSERT_ROWS";
          return [
            {
              value: option.value,
              label: option.label,
              descriptor: translate(
                insert ? "Add a new row" : "Reuse the destination row",
              ),
              instructions: translate(
                insert
                  ? "Insert a new row after the detected data table, shifting any rows below it down."
                  : "Write directly after the detected data table. Existing cells in that destination can be replaced.",
              ),
              recommended: insert,
              icon: <RowIcon insert={insert} />,
            },
          ];
        })}
      />
    </Control>
  );
}
