import { ButtonGroup } from "@components/elements/button-group/button-group";
import {
  type ChoiceCardOption,
  ChoiceCards,
} from "@components/elements/choice-cards/choice-cards";
import { Control } from "@components/form-controls/control";
import type { ControlType } from "@components/form-controls/types";
import { type Property, PropertyType } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";

const choices: Record<string, Omit<ChoiceCardOption, "value" | "icon">> = {
  Single: {
    descriptor: "No email confirmation",
    instructions:
      "The contact opts in through your form. No confirmation email is requested.",
    label: "Single",
  },
  Double: {
    descriptor: "Confirmation handled by you",
    instructions:
      "Use when you have already confirmed consent and kept a record. Dotdigital does not send the confirmation email.",
    label: "Double",
  },
  VerifiedDouble: {
    descriptor: "Confirmation sent by Dotdigital",
    instructions:
      "Dotdigital sends a confirmation email. The contact stays pending until they click the link.",
    label: "Verified Double",
  },
};

function Icon({ value }: { value: string }) {
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
      {value === "PlainText" ? (
        <>
          <path d="M6 3h8l4 4v14H6Z" />
          <path d="M14 3v5h4M9 12h6M9 16h6" />
        </>
      ) : value === "Html" ? (
        <path d="m8 6-6 6 6 6m8-12 6 6-6 6M14.5 4l-5 16" />
      ) : value === "Single" ? (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 3 3 5-6" />
        </>
      ) : value === "Double" ? (
        <path d="m3 12 4 4 8-9m-3 8 3 3 6-8" />
      ) : (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </>
      )}
    </svg>
  );
}

export function DotdigitalChoices({
  property,
  value,
  errors,
  context,
  updateValue,
}: ControlType<Property>) {
  if (property.type !== PropertyType.ButtonGroup) return null;
  return (
    <Control property={property} errors={errors} context={context}>
      {property.handle === "optInType" ? (
        <ChoiceCards
          label={property.label ?? property.handle}
          value={typeof value === "string" ? value : ""}
          disabled={property.disabled}
          onChange={updateValue}
          options={property.options.flatMap((option) => {
            if (!("value" in option)) return [];
            const details = choices[option.value];
            return [
              {
                value: option.value,
                label: translate(details?.label ?? option.label),
                descriptor: translate(details?.descriptor),
                instructions: translate(details?.instructions),
                icon: <Icon value={option.value} />,
              },
            ];
          })}
        />
      ) : (
        <ButtonGroup
          label={property.label}
          value={typeof value === "string" ? value : ""}
          options={property.options}
          onClick={updateValue}
          renderIcon={(value) => <Icon value={value} />}
        />
      )}
    </Control>
  );
}
