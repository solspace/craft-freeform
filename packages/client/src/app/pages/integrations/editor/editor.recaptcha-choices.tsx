import {
  type ChoiceCardOption,
  ChoiceCards,
} from "@components/elements/choice-cards/choice-cards";
import { Control } from "@components/form-controls/control";
import type { ControlType } from "@components/form-controls/types";
import { type Property, PropertyType } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";

const choices: Record<string, Omit<ChoiceCardOption, "value" | "icon">> = {
  legacy: {
    label: "Legacy",
    descriptor: "Site Key + Secret Key",
    instructions:
      "Use your site key and secret key, even if Google manages them in Cloud.",
  },
  enterprise: {
    recommended: true,
    label: "Google Cloud",
    descriptor: "Enterprise API",
    instructions:
      "Use your site key, project ID, and server API key for the Enterprise API.",
  },
  "v2-checkbox": {
    label: "Checkbox",
    descriptor: "Visible checkbox (v2)",
    instructions:
      "Visitors tick a box. Google may also ask them to solve a puzzle.",
  },
  "v2-invisible": {
    label: "Invisible",
    descriptor: "Challenge on submit (v2)",
    instructions:
      "No checkbox. Google may show a puzzle when the form is submitted.",
  },
  v3: {
    recommended: true,
    label: "Score-based",
    descriptor: "No challenge (v3)",
    instructions:
      "No checkbox or puzzle. Freeform checks a risk score on submit.",
  },
};

function ChoiceIcon({ value }: { value: string }) {
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
      {value === "enterprise" ? (
        <path d="M6 18h12a4 4 0 0 0 .6-8A7 7 0 0 0 5 9.8 4.1 4.1 0 0 0 6 18Z" />
      ) : value === "legacy" ? (
        <>
          <circle cx="8" cy="9" r="4" />
          <path d="m11 12 8 8 2-2-2-2 1-1-2-2-1 1" />
        </>
      ) : value === "v2-checkbox" ? (
        <>
          <rect x="4" y="4" width="16" height="16" rx="3" />
          <path d="m8 12 3 3 5-6" />
        </>
      ) : value === "v2-invisible" ? (
        <>
          <path d="M3 12s3-6 9-6 9 6 9 6-3 6-9 6-9-6-9-6Z" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="m3 3 18 18" />
        </>
      ) : (
        <>
          <path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6Z" />
          <path d="m8 12 3 3 5-6" />
        </>
      )}
    </svg>
  );
}

export function RecaptchaChoices({
  property,
  value,
  errors,
  context,
  updateValue,
}: ControlType<Property>) {
  if (property.type !== PropertyType.ButtonGroup) return null;
  const options = property.options.flatMap((option) => {
    if (!("value" in option)) return [];
    const details = choices[option.value];
    return [
      {
        value: option.value,
        label: translate(details?.label ?? option.label),
        descriptor: details?.descriptor
          ? translate(details.descriptor)
          : undefined,
        instructions: details?.instructions
          ? translate(details.instructions)
          : undefined,
        icon: <ChoiceIcon value={option.value} />,
        recommended: details?.recommended,
      },
    ];
  });
  return (
    <Control property={property} errors={errors} context={context}>
      <ChoiceCards
        label={property.label ?? property.handle}
        value={typeof value === "string" ? value : ""}
        options={options}
        disabled={property.disabled}
        onChange={updateValue}
      />
    </Control>
  );
}
