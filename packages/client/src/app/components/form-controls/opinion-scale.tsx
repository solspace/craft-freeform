import type { FormComponent } from "@components/form-controls";
import { Control } from "@components/form-controls/control";
import {
  ControlWrapper,
  FormField,
  Instructions,
  LabelGroup,
} from "@components/form-controls/control.styles";
import { TabularDataEditor } from "@components/form-controls/control-types/tabular-data/tabular-data.editor";
import { cleanRows } from "@components/form-controls/control-types/tabular-data/tabular-data.operations";
import { PreviewSlideout } from "@components/form-controls/preview/preview-slideout";
import { PreviewEmpty } from "@components/form-controls/preview/property-preview.styles";
import { usePreviewRollback } from "@components/form-controls/preview/use-preview-rollback";
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

type EditorActions = { finish: () => void; cancel: () => void };
const CleanupContext = createContext<
  (handle: string, actions: EditorActions) => void
>(() => {});
const Sections = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--xl, 24px);
  > ${ControlWrapper} {
    gap: var(--s, 8px);
  }
  ${LabelGroup} {
    flex: 0 0 auto;
  }
  ${FormField} {
    height: auto;
  }
  ${Instructions} {
    font-style: normal;
    line-height: 1.5;
    margin: var(--xs, 4px) 0 0;
  }
  > div + div {
    padding-top: var(--xl, 24px);
    border-top: 1px solid var(--border-hairline, rgba(51, 64, 77, .1));
  }
  min-width: 0;
`;
const EditorHint = styled.p`
  margin: 16px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--gray-500, #606d7b);
`;
const Summary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: var(--gray-800, #33404d);
  strong { display: block; margin-bottom: 4px; font-size: 12px; }
  span { color: var(--gray-500, #606d7b); }
  p { margin: 0; overflow-wrap: anywhere; }
`;
const SummaryEmpty = styled(PreviewEmpty)`
  min-height: 0;
`;

const SummaryControl: React.FC<ControlType<TabularDataProperty>> = ({
  property,
  value,
  errors,
}) => {
  const rows = (value || [])
    .map((row) => row.filter(Boolean).join(" — "))
    .filter(Boolean);
  return (
    <div>
      <strong>{translate(property.label)}</strong>
      {!rows.length ? (
        <SummaryEmpty>{translate("Not configured yet")}</SummaryEmpty>
      ) : (
        <p>{rows.join(", ")}</p>
      )}
      {errors?.map((error) => (
        <p className="error" key={error}>
          {translate(error)}
        </p>
      ))}
    </div>
  );
};

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
  const rollback = usePreviewRollback(
    value,
    updateValue,
    property.handle,
    context,
  );
  const captured = useRef(false);
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
    if (!captured.current) {
      rollback.onEdit();
      captured.current = true;
    }
    registerCleanup(property.handle, {
      finish: () => {
        if (isTranslating) return;
        const cleaned = cleanRows(values);
        if (cleaned.length !== values.length) updateValue(cleaned);
      },
      cancel: rollback.onCancel,
    });
  }, [
    registerCleanup,
    property.handle,
    values,
    updateValue,
    isTranslating,
    rollback,
  ]);
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
  const cleanups = useRef(new Map<string, EditorActions>());
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
            </Summary>
          }
          onAfterEdit={() =>
            cleanups.current.forEach((actions) => {
              actions.finish();
            })
          }
          onEdit={() => cleanups.current.clear()}
          onCancel={() =>
            cleanups.current.forEach((actions) => {
              actions.cancel();
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
