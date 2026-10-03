import { Checkbox } from "@components/elements/checkbox/checkbox";
import translate from "@ff-client/utils/translations";
import type React from "react";

type Props = {
  fieldUid: string;
  onChange?: (value: string) => void;
  value: string;
};

export const BooleanValueRule: React.FC<Props> = ({
  fieldUid,
  onChange,
  value,
}) => {
  return (
    <div className="checkbox-wrapper">
      <Checkbox
        id={`${fieldUid}-rule-checkbox`}
        label={translate(value ? "Checked" : "Unchecked")}
        onChange={(event) => onChange?.(event.target.checked ? "1" : "")}
        checked={Boolean(value)}
      />
    </div>
  );
};
