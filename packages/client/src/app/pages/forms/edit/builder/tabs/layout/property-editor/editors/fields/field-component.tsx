import { FormComponent } from "@components/form-controls";
import { OptionSampleArea } from "@editor/builder/sample-data/sample-data.styles";
import { SampleDataDefault } from "@editor/builder/sample-data/sample-data-default";
import { SampleDataOptions } from "@editor/builder/sample-data/sample-data-options";
import { useAppDispatch } from "@editor/store";
import { useValueUpdateGenerator } from "@editor/store/hooks/value-update-generator";
import { type Field, fieldActions } from "@editor/store/slices/layout/fields";
import { fieldSelectors } from "@editor/store/slices/layout/fields/fields.selectors";
import { useTranslations } from "@editor/store/slices/translations/translations.hooks";
import { useFieldType } from "@ff-client/queries/field-types";
import { Implementation } from "@ff-client/types/fields";
import { type Property, PropertyType } from "@ff-client/types/properties";
import type React from "react";
import { useSelector } from "react-redux";

type Props = {
  control?: React.ComponentProps<typeof FormComponent>["control"];
  property: Property;
  field: Field;
  autoFocus?: boolean;
};

export const FieldComponent: React.FC<Props> = ({
  property,
  control,
  field,
  autoFocus,
}) => {
  const dispatch = useAppDispatch();
  const type = useFieldType(field.typeClass);
  const { getTranslation, updateTranslation, canUseTranslationValue } =
    useTranslations(field);

  const fieldState = useSelector(fieldSelectors.one(field.uid));
  const context = {
    id: fieldState.id,
    ...(fieldState?.properties || {}),
  };

  const generateUpdateHandler = useValueUpdateGenerator(
    type.properties,
    context,
    (handle, value) => {
      if (!updateTranslation(handle, value)) {
        dispatch(
          fieldActions.edit({
            uid: field.uid,
            handle,
            value,
          }),
        );
      }
    },
  );

  const value = field.properties?.[property.handle];
  const translationEnabledValue = getTranslation(property.handle, value);

  if (property.handle === "sampleData" && !control) return null;

  if (
    !control &&
    property.handle === "defaultValue" &&
    !type?.implements.includes(Implementation.Options) &&
    (property.type === PropertyType.String ||
      property.type === PropertyType.Textarea)
  ) {
    return (
      <SampleDataDefault
        property={property}
        value={
          canUseTranslationValue(property) ? translationEnabledValue : value
        }
        updateValue={generateUpdateHandler(property)}
        context={field}
        errors={field.errors?.[property.handle]}
        fieldType={type?.type ?? "text"}
      />
    );
  }

  const component = (
    <FormComponent
      control={control}
      autoFocus={autoFocus}
      value={canUseTranslationValue(property) ? translationEnabledValue : value}
      property={property}
      updateValue={generateUpdateHandler(property)}
      errors={field.errors?.[property.handle]}
      context={field}
    />
  );
  const sampleProperty = type?.properties.find(
    (item) => item.handle === "sampleData",
  );
  const showSampleAction =
    (type?.type === "rating" && property.handle === "maxValue") ||
    (["file", "file-dnd"].includes(type?.type) &&
      property.handle === "fileKinds");
  if (sampleProperty && showSampleAction) {
    return (
      <OptionSampleArea>
        {component}
        <span className="sample-data-action">
          <SampleDataOptions
            property={sampleProperty}
            value={field.properties.sampleData}
            updateValue={generateUpdateHandler(sampleProperty)}
          />
        </span>
      </OptionSampleArea>
    );
  }
  return component;
};
