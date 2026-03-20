import { Dropdown } from "@components/elements/custom-dropdown/dropdown";
import { FormComponent } from "@components/form-controls";
import { Control } from "@components/form-controls/control";
import { FlexColumn } from "@components/layout/blocks/flex";
import { useTranslations } from "@editor/store/slices/translations/translations.hooks";
import { PropertyType } from "@ff-client/types/properties";
import type { FC } from "react";

import { useOptionTypesElements } from "../configurable/elements/elements.queries";

import type { TranslateOptionsProps } from "./translations";
import type { ElementTranslations } from "./translations.types";

export const SourceElements: FC<TranslateOptionsProps> = ({
  value,
  field,
  property,
  context,
}) => {
  const { getTranslation, updateTranslation } = useTranslations(field);
  const { data, isFetching } = useOptionTypesElements();

  if (value.source !== "elements") {
    return null;
  }

  const { handle } = property;

  const typeClass = value.typeClass;
  const typeProvider = data?.find((type) => type.typeClass === typeClass);

  const translation = getTranslation<ElementTranslations>(handle, {});
  const emptyOption: string = translation.emptyOption || "";
  const propertyTranslations = translation.properties || {};

  return (
    <Control property={property} context={context}>
      <FlexColumn>
        {property.showEmptyOption && (
          <FormComponent
            property={{
              type: PropertyType.String,
              label: "Empty Option Label (optional)",
              handle: "emptyOption",
            }}
            context={value}
            value={emptyOption}
            updateValue={(currentValue) => {
              updateTranslation(handle, {
                ...translation,
                emptyOption: currentValue as string,
              });
            }}
          />
        )}

        <Control
          property={{
            type: PropertyType.Select,
            label: "Type",
            handle: "predefinedOptionTypeClass",
            options: [],
          }}
        >
          <Dropdown
            emptyOption="Choose type"
            loading={isFetching}
            value={value.typeClass}
            options={[
              {
                label: typeProvider?.name || "",
                value: typeProvider?.typeClass || "",
              },
            ]}
          />
        </Control>

        {typeProvider?.properties.map((property) => {
          let currentPropertyValue = "";
          if (propertyTranslations?.[property.handle] !== undefined) {
            currentPropertyValue = propertyTranslations[property.handle];
          } else if (value.properties[property.handle] !== undefined) {
            currentPropertyValue = value.properties[property.handle] as string;
          }

          return (
            <FormComponent
              key={property.handle}
              property={property}
              context={value}
              value={currentPropertyValue}
              updateValue={(selectedValue) => {
                updateTranslation(handle, {
                  ...translation,
                  properties: {
                    ...translation.properties,
                    [property.handle]: selectedValue,
                  },
                });
              }}
            />
          );
        })}
      </FlexColumn>
    </Control>
  );
};
