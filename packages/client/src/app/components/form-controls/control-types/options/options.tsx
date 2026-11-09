import { ButtonGroup } from "@components/elements/button-group/button-group";
import { ControlWrapper } from "@components/form-controls/control.styles";
import { FormErrorList } from "@components/form-controls/error-list";
import { Label } from "@components/form-controls/label.styles";
import type { ControlType } from "@components/form-controls/types";
import { useFieldOptions } from "@components/options/use-field-options";
import config, { Edition } from "@config/freeform/freeform.config";
import { OptionsHeading } from "@editor/builder/sample-data/sample-data.styles";
import { SampleDataOptions } from "@editor/builder/sample-data/sample-data-options";
import { useAppDispatch, useAppSelector } from "@editor/store";
import { type Field, fieldActions } from "@editor/store/slices/layout/fields";
import { optionSourceActions } from "@editor/store/slices/option-sources";
import { useTranslations } from "@editor/store/slices/translations/translations.hooks";
import { useFieldType } from "@ff-client/queries/field-types";
import type { OptionsProperty } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import type React from "react";
import type { Option } from "./options.types";
import { Source, sourceLabels } from "./options.types";
import { generateDefaultValue } from "./sources/defaults";
import { SourceComponent } from "./sources/source.component";
import { OptionsTranslatable } from "./sources/translations/translations";

const SourceIcon = ({ source }: { source: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {source === Source.Custom ? (
      <path d="m16 3 5 5L9 20l-6 1 1-6L16 3Zm-2 2 5 5" />
    ) : source === Source.Elements ? (
      <path d="m12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5" />
    ) : (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="m6 8 1 1 2-2m-3 7 1 1 2-2m3-5h6m-6 6h6" />
      </>
    )}
  </svg>
);

const Options: React.FC<ControlType<OptionsProperty, Field>> = ({
  value,
  errors,
  property,
  updateValue,
  context,
}) => {
  const { source = Source.Custom } = value;
  const defaultValue: string | string[] = context.properties.defaultValue;

  const fieldType = useFieldType(context.typeClass);
  const isMultiple = fieldType?.implements.includes("multiValue");

  const autoUpdateHandle = context?.id === undefined;

  const { willTranslate } = useTranslations(context);

  const [options] = useFieldOptions(context, fieldType);
  const dispatch = useAppDispatch();
  const sampleProperty = fieldType?.properties?.find(
    (item) => item.handle === "sampleData",
  );
  const sampleAction = sampleProperty ? (
    <SampleDataOptions
      property={sampleProperty}
      value={context.properties.sampleData}
      updateValue={(enabled) =>
        dispatch(
          fieldActions.edit({
            uid: context.uid,
            handle: "sampleData",
            value: enabled,
          }),
        )
      }
    />
  ) : undefined;
  const sourceConfigurations = useAppSelector(
    (state) => state.optionSources[context.uid]?.[property.handle],
  );

  const rememberSource = (): void => {
    dispatch(
      optionSourceActions.remember({
        uid: context.uid,
        handle: property.handle,
        value,
      }),
    );
  };

  const updateDefaultValue = (value: string | string[]): void => {
    dispatch(
      fieldActions.edit({
        uid: context.uid,
        handle: "defaultValue",
        value,
      }),
    );
  };

  const convertToCustomValues = (): void => {
    rememberSource();
    updateValue({
      source: Source.Custom,
      useCustomValues: true,
      options: [...options] as Option[],
    });
  };

  if (willTranslate(property.handle)) {
    return (
      <OptionsTranslatable
        property={property}
        value={value}
        field={context}
        defaultValue={defaultValue}
        isMultiple={isMultiple}
        context={context}
        headerAction={sampleAction}
      />
    );
  }

  return (
    <>
      {config.editions.isAtLeast(Edition.Lite) && (
        <ControlWrapper $width={property.width}>
          <OptionsHeading>
            <Label>{translate("Source")}</Label>
            {sampleAction}
          </OptionsHeading>
          <ButtonGroup
            label={translate("Source")}
            stacked
            renderIcon={(selectedSource) => (
              <SourceIcon source={selectedSource} />
            )}
            options={sourceLabels}
            value={source}
            onClick={(selectedSource) => {
              if (selectedSource !== source) {
                rememberSource();
                updateValue(
                  sourceConfigurations?.[selectedSource as Source] ??
                    generateDefaultValue(selectedSource as Source),
                );
              }
            }}
          />
        </ControlWrapper>
      )}

      <SourceComponent
        value={value}
        updateValue={updateValue}
        property={property}
        defaultValue={defaultValue}
        updateDefaultValue={updateDefaultValue}
        convertToCustomValues={convertToCustomValues}
        isMultiple={isMultiple}
        allowOptgroup={property.allowOptgroup}
        autoUpdateHandle={autoUpdateHandle}
        headerAction={
          config.editions.isAtLeast(Edition.Lite) ? undefined : sampleAction
        }
      />

      <FormErrorList errors={errors} />
    </>
  );
};

export default Options;
