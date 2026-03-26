import { CraftEntryPicker } from "@components/elements/craft-entry-picker/craft-entry-picker";
import type { ControlType } from "@components/form-controls/types";
import type { AssetPickerProperty } from "@ff-client/types/properties";
import type React from "react";
import { Control } from "../../control";

const EntryPicker: React.FC<ControlType<AssetPickerProperty>> = ({
  value,
  property,
  errors,
  updateValue,
}) => {
  const { criteria, multiSelect, actionLabel, limit } = property;

  return (
    <Control property={property} errors={errors}>
      <CraftEntryPicker
        actionLabel={actionLabel}
        criteria={criteria}
        limit={limit}
        multiSelect={multiSelect}
        value={value}
        onUpdate={updateValue}
      />
    </Control>
  );
};

export default EntryPicker;
