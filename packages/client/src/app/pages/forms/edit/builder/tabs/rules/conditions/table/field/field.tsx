import { Dropdown } from "@components/elements/custom-dropdown/dropdown";
import type { Condition } from "@ff-client/types/rules";
import type React from "react";
import { useParams } from "react-router-dom";

type Props = {
  condition: Condition;
  onChange: (fieldUid: string) => void;
};

import { useFieldOptionCollection } from "@editor/store/slices/layout/fields/fields.hooks";
import { fieldRuleSelectors } from "@editor/store/slices/rules/fields/field-rules.selectors";
import { useSelector } from "react-redux";

export const FieldSelect: React.FC<Props> = ({ condition, onChange }) => {
  const { uid } = useParams();

  const usedBy = useSelector(fieldRuleSelectors.usedByFields(uid));
  const options = useFieldOptionCollection(
    [...usedBy, uid],
    ["html", "rich-text", "file", "file-dnd", "signature"],
  );

  return (
    <Dropdown
      options={options}
      emptyOption="Choose field"
      value={condition.field}
      onChange={onChange}
    />
  );
};
