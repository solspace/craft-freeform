import "../../../../../styles/src/cp/choice-cards/choice-cards.css";
import translate from "@ff-client/utils/translations";
import type { FC } from "react";

import {
  matchesPermissionPreset,
  type PermissionPresetId,
  permissionPresets,
} from "./limited-users.presets";
import {
  Actions,
  PresetButton,
  PresetDescription,
  PresetGrid,
  PresetHeader,
  PresetSection,
} from "./limited-users.styles";
import type { Item } from "./limited-users.types";

type Props = {
  items: Item[];
  disabled: boolean;
  canUndo: boolean;
  onApply: (id: PermissionPresetId) => void;
  onUndo: () => void;
};

const presetIcons: Record<PermissionPresetId, string> = {
  "full-access":
    "M10 6h10M10 12h10M10 18h10M3 5l2 2 3-4M3 11l2 2 3-4M3 17l2 2 3-4",
  "simplified-building": "M5 4h14v16H5V4Zm4 4h6M9 12h6M9 16h3",
  "content-editor": "M4 20h4L20 8l-4-4L4 16v4Zm10-14 4 4M4 20h16",
  "advanced-building":
    "M4 6h6m4 0h6M4 12h10m4 0h2M4 18h2m4 0h10M10 3v6M14 9v6M6 15v6",
};

export const PermissionPresets: FC<Props> = ({
  items,
  disabled,
  canUndo,
  onApply,
  onUndo,
}) => (
  <PresetSection aria-labelledby="permission-presets-heading">
    <PresetHeader>
      <h2 id="permission-presets-heading">
        {translate("Start from a preset")}
      </h2>
      {canUndo && (
        <Actions>
          <button
            type="button"
            disabled={disabled}
            onClick={onUndo}
            title={translate("Restore all options to before the last preset.")}
          >
            {translate("Undo preset")}
          </button>
        </Actions>
      )}
    </PresetHeader>
    <p>
      {translate(
        "Replace the options below with a starting point, then fine-tune and Save.",
      )}
    </p>
    <PresetGrid>
      {permissionPresets.map((preset) => (
        <PresetButton
          className="ff-choice-card"
          key={preset.id}
          type="button"
          disabled={disabled}
          aria-pressed={matchesPermissionPreset(items, preset.id)}
          onClick={() => onApply(preset.id)}
        >
          <span className="choice-heading">
            <span className="choice-icon" aria-hidden="true">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={presetIcons[preset.id]} />
              </svg>
            </span>
            <strong>{translate(preset.label)}</strong>
          </span>
          <PresetDescription>{translate(preset.description)}</PresetDescription>
        </PresetButton>
      ))}
    </PresetGrid>
  </PresetSection>
);
