import { Display } from "@ff-client/types/rules";
import translate from "@ff-client/utils/translations";
import type React from "react";
import { InlineSelect } from "../inline-select.styles";

type Props = {
  value: Display;
  onChange?: (value: Display) => void;
};

export const DisplaySelect: React.FC<Props> = ({ value, onChange }) => {
  return (
    <InlineSelect>
      <select
        aria-label={translate("Field visibility")}
        value={value}
        onChange={(event) => onChange?.(event.target.value as Display)}
      >
        <option value={Display.Show}>{translate("show")}</option>
        <option value={Display.Hide}>{translate("hide")}</option>
      </select>
    </InlineSelect>
  );
};
