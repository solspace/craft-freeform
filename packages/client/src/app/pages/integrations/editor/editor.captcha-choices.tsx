import {
  type ChoiceCardOption,
  ChoiceCards,
} from "@components/elements/choice-cards/choice-cards";
import { Control } from "@components/form-controls/control";
import type { ControlType } from "@components/form-controls/types";
import { type Property, PropertyType } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";

const choices: Record<string, Omit<ChoiceCardOption, "value" | "icon">> = {
  invisible: {
    recommended: true,
    label: "Invisible",
    descriptor: "Challenge on submit",
    instructions:
      "No checkbox. hCaptcha may show a puzzle when the form is submitted.",
  },
  checkbox: {
    label: "Checkbox",
    descriptor: "Visible checkbox",
    instructions:
      "Visitors tick a box. hCaptcha may also ask them to solve a puzzle.",
  },
  focus: {
    label: "On form focus",
    descriptor: "When a field is focused",
    instructions: "Starts when the visitor focuses a field in the form.",
    recommended: true,
  },
  auto: {
    label: "When widget loads",
    descriptor: "As soon as the widget loads",
    instructions:
      "Starts automatically when the widget is ready. With delayed loading, it waits for the widget to load.",
  },
  none: {
    label: "On request",
    descriptor: "When the visitor starts verification",
    instructions:
      "The visitor clicks the widget to start. Freeform also starts it when the form is submitted.",
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
      {value === "checkbox" ? (
        <>
          <rect x="4" y="4" width="16" height="16" rx="3" />
          <path d="m8 12 3 3 5-6" />
        </>
      ) : value === "invisible" ? (
        <>
          <path d="M3 12s3-6 9-6 9 6 9 6-3 6-9 6-9-6-9-6Z" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="m3 3 18 18" />
        </>
      ) : value === "auto" ? (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="m10 8 6 4-6 4Z" />
        </>
      ) : value === "focus" ? (
        <>
          <path d="M8 3H4v4m12-4h4v4M4 17v4h4m12-4v4h-4" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <path d="m8 3 11 10-6 1-3 6-2-17Z" />
      )}
    </svg>
  );
}

export function CaptchaChoices({
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
          const details = choices[option.value];
          return [
            {
              value: option.value,
              label: translate(details?.label ?? option.label),
              descriptor: translate(details?.descriptor),
              instructions: translate(details?.instructions),
              recommended: details?.recommended,
              icon: <Icon value={option.value} />,
            },
          ];
        })}
      />
    </Control>
  );
}
