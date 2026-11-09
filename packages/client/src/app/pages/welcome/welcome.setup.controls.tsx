import { Dropdown } from "@components/elements/custom-dropdown/dropdown";
import { addSelectOptionIcons } from "@components/form-controls/control-types/select/select-option-icons";
import translate from "@ff-client/utils/translations";
import { useState } from "react";
import type { SetupSelectOption } from "./welcome.setup.api";

export function SetupSwitch({
  id,
  label,
  checked,
  disabled,
  onChange,
}: {
  id?: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      id={id}
      className={`lightswitch ${checked ? "on" : ""}`}
      role="switch"
      aria-label={label}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <div className="lightswitch-container">
        <div className="handle" />
      </div>
    </button>
  );
}

export function SetupSelect({
  label,
  value,
  options,
  formatting,
  recommendedValue,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  options: SetupSelectOption[];
  formatting?: boolean;
  recommendedValue?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const choices = options.map((option) => ({
    ...option,
    label: translate(option.label),
  }));
  if (!choices.some((option) => option.value === value))
    choices.unshift({ value, label: value || translate("Not set") });
  const decorated = formatting
    ? addSelectOptionIcons("formattingTemplate", [
        { label: "Solspace", children: choices },
      ])?.flatMap((option) => ("children" in option ? option.children : option))
    : choices;
  return (
    <Dropdown
      ariaLabel={label}
      disabled={disabled}
      value={value}
      options={decorated}
      showSelectedIcon={formatting}
      recommendedValue={recommendedValue}
      onChange={onChange}
    />
  );
}

const weekdays = [
  ["Sun", "Sunday"],
  ["Mon", "Monday"],
  ["Tue", "Tuesday"],
  ["Wed", "Wednesday"],
  ["Thu", "Thursday"],
  ["Fri", "Friday"],
  ["Sat", "Saturday"],
];
export function DigestSchedule({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const [lastDay, setLastDay] = useState(value === "-1" ? "1" : value);
  const daily = value === "-1";
  return (
    <fieldset className="setup-digest" aria-label={label}>
      <div className="setup-digest-row">
        <fieldset
          className="btngroup btngroup--exclusive"
          aria-label={translate("Frequency")}
        >
          {["Daily", "Weekly"].map((mode, index) => (
            <button
              key={mode}
              type="button"
              className={`btn ${daily === (index === 0) ? "active" : ""}`}
              aria-pressed={daily === (index === 0)}
              disabled={disabled}
              onClick={() => {
                if (!daily) setLastDay(value);
                onChange(index === 0 ? "-1" : lastDay);
              }}
            >
              {translate(mode)}
            </button>
          ))}
        </fieldset>
        {!daily && (
          <fieldset
            className="btngroup btngroup--exclusive"
            aria-label={translate("Day of the week")}
          >
            {weekdays.map(([short, name], day) => (
              <button
                key={name}
                type="button"
                className={`btn ${value === String(day) ? "active" : ""}`}
                aria-label={translate(name)}
                aria-pressed={value === String(day)}
                disabled={disabled}
                onClick={() => {
                  setLastDay(String(day));
                  onChange(String(day));
                }}
              >
                {translate(short)}
              </button>
            ))}
          </fieldset>
        )}
      </div>
      <p className="setup-note" aria-live="polite">
        {daily
          ? translate("Every morning")
          : translate("Every {day} morning", {
              day: translate(weekdays[Number(value)]?.[1] || "Monday"),
            })}
      </p>
    </fieldset>
  );
}

const paths: Record<string, string> = {
  developers: "m8 5-6 7 6 7m8-14 6 7-6 7m-3-17-2 20",
  editors: "M4 4h12v16H4zM8 8h4M8 12h3m4 5 6-6 2 2-6 6-3 1z",
  both: "M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21v-3a6 6 0 0 1 12 0v3m3-17a4 4 0 0 1 0 8m1 3a6 6 0 0 1 4 6",
  samples: "M3 3h18v18H3zM3 8h18M8 8v13m4-9h5m-5 4h5",
  custom: "M5 2h10l4 4v16H5zM14 2v5h5m-9 4-3 3 3 3m4-6 3 3-3 3",
  headless:
    "M7 3H5a2 2 0 0 0-2 2v4l-2 3 2 3v4a2 2 0 0 0 2 2h2m10-18h2a2 2 0 0 1 2 2v4l2 3-2 3v4a2 2 0 0 1-2 2h-2M9 10h6m-6 4h6",
  mixed: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zm10 3h6m-3-3v6",
  basic: "M6 3h12v18H6zM9 7h6m-6 4h6m-6 4h3",
  growing: "M2 6h5v15H2zM10 3h5v18h-5zM18 9h5v12h-5z",
  advanced: "M3 3h6v5H3zM15 16h6v5h-6zM3 16h6v5H3zM6 8v4h12v4m-12-4v4m6-4V3h9",
};
export function WorkflowIcon({ value }: { value: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[value]} />
    </svg>
  );
}
