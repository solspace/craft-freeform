import type { FormComponent } from "@components/form-controls";
import { Control } from "@components/form-controls/control";
import { TabularDataEditor } from "@components/form-controls/control-types/tabular-data/tabular-data.editor";
import { cleanRows } from "@components/form-controls/control-types/tabular-data/tabular-data.operations";
import { PreviewSlideout } from "@components/form-controls/preview/preview-slideout";
import type { ControlType } from "@components/form-controls/types";
import { useTranslations } from "@editor/store/slices/translations/translations.hooks";
import { Fields } from "@ff-client/types/field.classes";
import {
  type Property,
  PropertyType,
  type TabularDataProperty,
} from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import type React from "react";
import { createContext, useContext, useLayoutEffect, useRef } from "react";
import styled from "styled-components";

type ControlComponent = React.ComponentProps<typeof FormComponent>["control"];
type Props = {
  typeClass: string;
  property: Property;
  properties: Property[];
  renderProperty: (
    property: Property,
    control?: ControlComponent,
  ) => React.ReactNode;
};

const CleanupContext = createContext<
  (handle: string, cleanup: () => void) => void
>(() => {});
const Sections = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--c-spacing-lg, 24px);
  > div + div {
    padding-top: var(--c-spacing-lg, 24px);
    border-top: 1px solid var(--c-color-neutral-border-quiet);
  }
  min-width: 0;
`;
const EditorHint = styled.p`
  margin: var(--c-spacing-md, 16px) 0 0;
  font-size: var(--c-text-sm, 12px);
  line-height: var(--c-leading-normal);
  color: var(--c-text-light);
`;
const EditCue = styled.div`
  border-top: 1px solid var(--c-color-neutral-border-quiet);
  padding-top: 10px;
  color: var(--c-color-accent-on-quiet);
  font-weight: 600;
  font-size: var(--c-text-sm, 12px);
`;
const Summary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--c-color-neutral-border-quiet);
  border-radius: var(--c-form-control-radius);
  background: var(--c-color-neutral-fill-quiet);
  color: var(--c-text-default);
  &:hover { background: var(--c-color-neutral-fill-normal); }
  strong { display: block; margin-bottom: 4px; }
  span { color: var(--c-text-light); }
  p { margin: 0; overflow-wrap: anywhere; }
`;

const SummaryControl: React.FC<ControlType<TabularDataProperty>> = ({
  property,
  value,
  errors,
}) => (
  <div>
    <strong>{translate(property.label)}</strong>
    {!value?.length ? (
      <span>{translate("Not configured yet")}</span>
    ) : (
      <p>
        {value
          .map((row) => row.filter(Boolean).join(" — "))
          .filter(Boolean)
          .join(", ")}
      </p>
    )}
    {errors?.map((error) => (
      <p className="error" key={error}>
        {translate(error)}
      </p>
    ))}
  </div>
);

const EditorHintControl: React.FC<ControlType<TabularDataProperty>> = ({
  property,
  context,
}) => {
  // biome-ignore lint/suspicious/noExplicitAny: Same field context used by the standard tabular data control.
  const { willTranslate } = useTranslations(context as any);
  if (willTranslate(property.handle)) return null;
  return (
    <EditorHint>
      {translate(
        "Drag rows to reorder them. Press Enter in a cell to add another row.",
      )}
    </EditorHint>
  );
};

const InlineControl: React.FC<ControlType<TabularDataProperty>> = ({
  property,
  value,
  errors,
  context,
  updateValue,
}) => {
  const registerCleanup = useContext(CleanupContext);
  // biome-ignore lint/suspicious/noExplicitAny: Same field context used by the standard tabular data control.
  const { willTranslate } = useTranslations(context as any);
  const values = Array.isArray(value) ? value : [];
  const isTranslating = willTranslate(property.handle);
  const isScales = property.handle === "scales";
  const displayProperty = {
    ...property,
    instructions: isScales
      ? "Values are saved with submissions. Optional labels are displayed instead of values."
      : "Optional descriptions shown below the scale. They do not need to match the number of choices.",
  };
  useLayoutEffect(() => {
    registerCleanup(property.handle, () => {
      if (isTranslating) return;
      const cleaned = cleanRows(values);
      if (cleaned.length !== values.length) updateValue(cleaned);
    });
  }, [registerCleanup, property.handle, values, updateValue, isTranslating]);
  return (
    <Control property={displayProperty} errors={errors} context={context}>
      <TabularDataEditor
        property={property}
        configuration={property.configuration}
        values={values}
        updateValue={updateValue}
        context={context}
        compact
        addLabel={isScales ? "Add a scale" : "Add a legend"}
        deleteLabel={isScales ? "Delete scale" : "Delete legend"}
        emptyMessage={
          isScales
            ? "No scales yet. Add a scale to get started."
            : "No legends yet. Legends are optional."
        }
        showHelp={false}
      />
    </Control>
  );
};

/** Group only Opinion Scale's existing properties; each keeps its own update/translation handler. */
export const OpinionScaleProperty: React.FC<Props> = ({
  typeClass,
  property,
  properties,
  renderProperty,
}) => {
  const cleanups = useRef(new Map<string, () => void>());
  const scales = properties.find(
    (item) =>
      item.handle === "scales" && item.type === PropertyType.TabularData,
  );
  const legends = properties.find(
    (item) =>
      item.handle === "legends" && item.type === PropertyType.TabularData,
  );
  if (
    typeClass !== Fields.OpinionScale ||
    !scales ||
    !legends ||
    !["scales", "legends"].includes(property.handle)
  ) {
    return <>{renderProperty(property)}</>;
  }
  if (property.handle === "legends") return null;
  return (
    <CleanupContext.Provider
      value={(handle, cleanup) => cleanups.current.set(handle, cleanup)}
    >
      <Control label="Scales & Legends">
        <PreviewSlideout
          title={translate("Opinion Scale Configuration")}
          fillEditor={false}
          preview={
            <Summary>
              {renderProperty(scales, SummaryControl as ControlComponent)}
              {renderProperty(legends, SummaryControl as ControlComponent)}
              <EditCue>{translate("Edit scales & legends")}</EditCue>
            </Summary>
          }
          onAfterEdit={() =>
            cleanups.current.forEach((cleanup) => {
              cleanup();
            })
          }
        >
          <Sections>
            {renderProperty(scales, InlineControl as ControlComponent)}
            {renderProperty(legends, InlineControl as ControlComponent)}
          </Sections>
          {renderProperty(legends, EditorHintControl as ControlComponent)}
        </PreviewSlideout>
      </Control>
    </CleanupContext.Provider>
  );
};
