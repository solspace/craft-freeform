import { Dropdown } from "@components/elements/custom-dropdown/dropdown";
import translate from "@ff-client/utils/translations";
import { useId, useRef } from "react";
import styled from "styled-components";
import { WizardIcon } from "./wizard/wizard.icon";
import type { WizardOptions } from "./wizard/wizard.types";

export function StartingPointPicker({
  value,
  presets,
  loading,
  disabled,
  onChange,
}: {
  value: string;
  presets: WizardOptions["presets"];
  loading: boolean;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const labelId = useId();
  const hintId = useId();
  const trigger = useRef<HTMLDivElement>(null);
  const selected = presets.find((preset) => preset.id === value);
  return (
    <StartingPoint>
      <span id={labelId} className="starting-point-label">
        {translate("Starting point")}
      </span>
      {/* biome-ignore lint/a11y/useSemanticElements: The shared dropdown has popup buttons and needs a separate keyboard trigger. */}
      <div
        ref={trigger}
        role="button"
        aria-labelledby={labelId}
        aria-describedby={hintId}
        aria-disabled={disabled || loading}
        tabIndex={disabled || loading ? -1 : 0}
        className="starting-point-trigger"
        style={{ pointerEvents: disabled || loading ? "none" : undefined }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && trigger.current?.querySelector(".open"))
            requestAnimationFrame(() => trigger.current?.focus());
          if (
            event.target === event.currentTarget &&
            ["Enter", " "].includes(event.key)
          )
            event.preventDefault();
        }}
        onKeyUp={(event) => {
          if (
            event.target === event.currentTarget &&
            ["Enter", " "].includes(event.key)
          ) {
            event.stopPropagation();
            if (!disabled && !loading)
              (event.currentTarget.firstElementChild as HTMLElement)?.click();
          }
        }}
      >
        <Dropdown
          value={value}
          loading={loading}
          showSelectedIcon
          options={[
            {
              value: "",
              label: translate("Blank form"),
              icon: <WizardIcon kind="blank" />,
            },
            ...presets
              .filter((preset) => preset.id !== "other")
              .map((preset) => ({
                value: preset.id,
                label: preset.label,
                icon: <WizardIcon kind={preset.id} />,
              })),
          ]}
          onChange={(next) => {
            if (!disabled) onChange(next);
          }}
        />
      </div>
      <p id={hintId}>
        {selected ? (
          <>
            {selected.description}{" "}
            {translate(
              "{count} fields will be added. You can edit them in the builder.",
              { count: selected.fields.length },
            )}
          </>
        ) : (
          translate("Start with an empty layout and add fields in the builder.")
        )}
      </p>
    </StartingPoint>
  );
}

const StartingPoint = styled.div`
  .starting-point-label { display: block; margin-bottom: 5px; font-weight: 700; }
  .starting-point-trigger { border-radius: 5px; }
  .starting-point-trigger:focus-visible { outline: 2px solid var(--link-color, #2563eb); outline-offset: 2px; }
  .starting-point-trigger[aria-disabled=true] { opacity: .65; }
  p { margin: 7px 0 0; color: #738196; font-size: 12px; line-height: 1.5; }
`;
