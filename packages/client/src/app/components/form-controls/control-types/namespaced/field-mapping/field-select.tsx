import { Dropdown } from "@components/elements/custom-dropdown/dropdown";
import { useFieldOptionCollection } from "@editor/store/slices/layout/fields/fields.hooks";
import translate from "@ff-client/utils/translations";
import ExclamationIcon from "@ff-icons/actions/exclamation";
import type React from "react";

type Props = {
  value: string;
  onChange: (fieldUid: string) => void;
};

export const FieldSelect: React.FC<Props> = ({ value, onChange }) => {
  const options = useFieldOptionCollection();

  return (
    <Dropdown
      options={options}
      emptyOption={translate("Do not map this field")}
      missingOption={{
        label: translate("Mapped field no longer exists"),
        icon: <ExclamationIcon />,
      }}
      value={value}
      onChange={onChange}
    />
  );
};
