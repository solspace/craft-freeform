import { FormComponent } from "@components/form-controls";
import { OptionSampleArea } from "@editor/builder/sample-data/sample-data.styles";
import { SampleDataDefault } from "@editor/builder/sample-data/sample-data-default";
import { SampleDataOptions } from "@editor/builder/sample-data/sample-data-options";
import { useAppDispatch } from "@editor/store";
import { useValueUpdateGenerator } from "@editor/store/hooks/value-update-generator";
import { type Field, fieldActions } from "@editor/store/slices/layout/fields";
import { fieldSelectors } from "@editor/store/slices/layout/fields/fields.selectors";
import { useTranslations } from "@editor/store/slices/translations/translations.hooks";
import { changeLayoutPreset } from "@editor/store/thunks/fields/containers";
import { useFieldType } from "@ff-client/queries/field-types";
import { Fields } from "@ff-client/types/field.classes";
import { Implementation } from "@ff-client/types/fields";
import { type Property, PropertyType } from "@ff-client/types/properties";
import escapeHtml from "lodash/escape";
import type React from "react";
import { useSelector } from "react-redux";

import {
  LocationIntegration,
  LocationRequiredComponents,
} from "./location-integration";

type Props = {
  control?: React.ComponentProps<typeof FormComponent>["control"];
  property: Property;
  field: Field;
  autoFocus?: boolean;
};

const legacyCalloutHtml = (content: unknown): string =>
  escapeHtml(String(content ?? "")).replace(/\r\n?|\n/g, "<br>");

export const FieldComponent: React.FC<Props> = ({
  property,
  control,
  field,
  autoFocus,
}) => {
  const dispatch = useAppDispatch();
  const type = useFieldType(field.typeClass);
  const {
    getTranslation,
    hasTranslation,
    updateTranslation,
    canUseTranslationValue,
  } = useTranslations(field);

  const fieldState = useSelector(fieldSelectors.one(field.uid));
  const context = {
    id: fieldState.id,
    ...(fieldState?.properties || {}),
  };

  const generateUpdateHandler = useValueUpdateGenerator(
    type.properties,
    context,
    (handle, value) => {
      if (
        field.typeClass === Fields.Callout &&
        handle === "richContent" &&
        value ===
          legacyCalloutHtml(getTranslation("content", field.properties.content))
      ) {
        // Preserve the original plain-text value when cancelling its first edit.
        value = null;
      }
      if (field.typeClass === Fields.Layout && handle === "preset") {
        dispatch(changeLayoutPreset(field.uid, String(value)));
        return;
      }
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

  const isCalloutRichText =
    field.typeClass === Fields.Callout && property.handle === "richContent";
  const storedValue = field.properties?.[property.handle];
  const value =
    isCalloutRichText && storedValue == null
      ? legacyCalloutHtml(field.properties.content)
      : storedValue;
  const translationEnabledValue =
    isCalloutRichText &&
    hasTranslation("content") &&
    !hasTranslation("richContent")
      ? legacyCalloutHtml(getTranslation("content", field.properties.content))
      : getTranslation(property.handle, value);

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
      control={
        control ||
        (type?.type === "location" && property.handle === "integration"
          ? LocationIntegration
          : type?.type === "location" &&
              property.handle === "requiredComponents"
            ? LocationRequiredComponents
            : undefined)
      }
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
