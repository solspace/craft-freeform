import { FormComponent } from "@components/form-controls";
import type { ControlType } from "@components/form-controls/types";
import { useModal } from "@components/modals/modal.context";
import { useAppDispatch } from "@editor/store";
import type { Field } from "@editor/store/slices/layout/fields";
import { fieldThunks } from "@editor/store/thunks/fields";
import {
  useFetchFieldTypes,
  useFieldTypeSearch,
} from "@ff-client/queries/field-types";
import type { FieldTypeProperty } from "@ff-client/types/properties";
import { PropertyType } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import type React from "react";

const FieldType: React.FC<ControlType<FieldTypeProperty>> = ({
  property,
  context,
}) => {
  const dispatch = useAppDispatch();
  const { confirm } = useModal();
  const searchFieldType = useFieldTypeSearch();
  const { data: types } = useFetchFieldTypes();
  const field = context as Field;

  if (!field?.typeClass) {
    return null;
  }

  return (
    <FormComponent
      value={field.typeClass}
      property={{
        type: PropertyType.Select,
        handle: "typeClass",
        label: translate(property.label),
        instructions: translate(property.instructions),
        options: types
          .filter(
            (type) =>
              type.visible !== false &&
              !["layout", "content"].includes(type.type),
          )
          .map((type) => ({
            label: translate(type.name),
            value: type.typeClass,
          })),
      }}
      updateValue={(value) => {
        if (value === field.typeClass) return;
        confirm({
          title: translate("Change field type?"),
          message: translate(
            "Are you sure? You might potentially lose important data.",
          ),
          confirmLabel: translate("Change field type"),
          onConfirm: () =>
            dispatch(
              fieldThunks.change.type(field, searchFieldType(value as string)),
            ),
        });
      }}
    />
  );
};

export default FieldType;
