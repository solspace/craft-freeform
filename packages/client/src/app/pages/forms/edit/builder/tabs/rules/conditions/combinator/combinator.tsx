import { Combinator } from "@ff-client/types/rules";
import translate from "@ff-client/utils/translations";
import type React from "react";
import { InlineSelect } from "../inline-select.styles";

type Props = {
  value: Combinator;
  onChange?: (value: Combinator) => void;
};

export const CombinatorSelect: React.FC<Props> = ({ value, onChange }) => {
  return (
    <InlineSelect>
      <select
        aria-label={translate("Rule matching")}
        value={value}
        onChange={(event) => onChange?.(event.target.value as Combinator)}
      >
        <option value={Combinator.Or}>{translate("any")}</option>
        <option value={Combinator.And}>{translate("all")}</option>
      </select>
    </InlineSelect>
  );
};
