import { Display } from "@ff-client/types/rules";
import translate from "@ff-client/utils/translations";
import type React from "react";

type Props = {
  value: Display;
  onChange?: (value: Display) => void;
};

export const DisplaySelect: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="select">
      <select
        value={value}
        onChange={(event) => onChange?.(event.target.value as Display)}
      >
        <option value={Display.Show}>{translate("show")}</option>
        <option value={Display.Hide}>{translate("hide")}</option>
      </select>
    </div>
  );
};
