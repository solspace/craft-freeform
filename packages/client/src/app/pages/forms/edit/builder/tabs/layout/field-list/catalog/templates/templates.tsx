import config, { Edition } from "@config/freeform/freeform.config";
import { useAppDispatch } from "@editor/store";
import { fieldThunks } from "@editor/store/thunks/fields";
import { useFetchFieldTypes } from "@ff-client/queries/field-types";
import { useFetchGroups } from "@ff-client/queries/groups";
import { colors } from "@ff-client/styles/variables";
import { Fields } from "@ff-client/types/field.classes";
import type { FieldType } from "@ff-client/types/fields";
import { type Option, PropertyType } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import { useCallback } from "react";
import styled from "styled-components";
import { useBaseFieldDrag } from "../../implementations/base-fields/field-item.drag";
import { CatalogPopover } from "../catalog-popover";

const templateIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 2.5h7l3 3V17.5H5z"/><path d="M12 2.5v3h3M8 9l-2 2 2 2m4-4 2 2-2 2"/></svg>';

const TemplateOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
`;

const TemplateCardButton = styled.div`
  min-width: 0;
  overflow: hidden;
  border: 1px solid ${colors.gray100};
  border-radius: 5px;
  background: ${colors.white};
  color: ${colors.gray700};
  cursor: grab;
  &:hover { border-color: ${colors.gray300}; background: ${colors.gray050}; }
  &:focus-visible { outline: 2px solid ${colors.blue400}; outline-offset: 2px; }
  &:active { cursor: grabbing; }
`;

const TemplatePreview = styled.div`
  height: 70px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 12px;
  background: #f2f6fa;
  .media { width: 46px; height: 42px; flex: 0 0 46px; border-radius: 3px; background: #d6e3ef; }
  .lines { display: grid; flex: 1; min-width: 0; gap: 5px; }
  .line { height: 5px; border-radius: 3px; background: #c2d0df; }
  .line:first-child { height: 7px; width: 70%; background: #71879e; }
  .line:last-child { width: 62%; }
  &[data-kind="form"] .line:nth-child(2) { height: 15px; border: 1px solid #b3c5d7; background: white; }
  &[data-kind="text"] .line:first-child { width: 82%; height: 5px; background: #a6b8ca; }
`;

const TemplateDetails = styled.div`
  padding: 10px 12px 12px;
  .title { display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 600; line-height: 18px; }
  .title svg { display: block; width: 17px; height: 17px; flex: 0 0 17px; }
  .title span { min-width: 0; overflow-wrap: anywhere; }
  .description { margin: 5px 0 0; font-size: 11px; line-height: 1.4; color: ${colors.gray500}; }
`;

function withTemplate(type: FieldType, option: Option): FieldType {
  return {
    ...type,
    name: option.label,
    properties: type.properties.map((property) =>
      property.handle === "template" && property.type === PropertyType.Select
        ? { ...property, value: option.value }
        : property,
    ),
  };
}

type TemplateCardProps = {
  fieldType: FieldType;
  preview: string;
  description?: string;
  onAdd: () => void;
};

const TemplateCard: React.FC<TemplateCardProps> = ({
  fieldType,
  preview,
  description,
  onAdd,
}) => {
  const dispatch = useAppDispatch();
  const { ref } = useBaseFieldDrag(fieldType);
  const connectDrag = useCallback(
    (element: HTMLDivElement | null) => {
      ref(element);
    },
    [ref],
  );
  const add = () => {
    dispatch(fieldThunks.move.newField.newRow({ fieldType }));
    onAdd();
  };

  return (
    <TemplateCardButton
      ref={connectDrag}
      role="button"
      tabIndex={0}
      aria-label={translate(fieldType.name)}
      onClick={add}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          add();
        }
      }}
    >
      <TemplatePreview data-kind={preview} aria-hidden="true">
        {preview === "media" && <span className="media" />}
        <span className="lines">
          <span className="line" />
          <span className="line" />
          <span className="line" />
        </span>
      </TemplatePreview>
      <TemplateDetails>
        <div className="title">
          <span
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: templateIcon }}
          />
          <span>{translate(fieldType.name)}</span>
        </div>
        {description && <p className="description">{description}</p>}
      </TemplateDetails>
    </TemplateCardButton>
  );
};

export const TemplateCatalog: React.FC<{ query: string }> = ({ query }) => {
  const { data: types } = useFetchFieldTypes();
  const { data: groups } = useFetchGroups();
  const type = types?.find(
    (item) => item.typeClass === Fields.BuilderTemplate && item.visible,
  );
  const property = type?.properties.find((item) => item.handle === "template");
  const options =
    property?.type === PropertyType.Select
      ? property.options.filter((item): item is Option => "value" in item)
      : [];
  const details = groups?.catalogs?.templateDetails ?? {};
  const matching = options.filter((option) =>
    `${option.label} ${details[option.value]?.description ?? ""} templates`
      .toLowerCase()
      .includes(query),
  );
  if (
    !config.editions.is(Edition.Pro) ||
    !type ||
    !matching.length ||
    groups?.groups?.hidden?.includes(type.typeClass)
  )
    return null;

  return (
    <CatalogPopover name="Templates" icon={templateIcon} wide>
      {(close) => (
        <>
          <TemplateOptions>
            {matching.map((option) => (
              <TemplateCard
                key={option.value}
                fieldType={withTemplate(type, option)}
                preview={details[option.value]?.preview ?? "text"}
                description={details[option.value]?.description}
                onAdd={close}
              />
            ))}
          </TemplateOptions>
          <p>
            {translate("Click to add, or drag a template into your layout.")}
          </p>
        </>
      )}
    </CatalogPopover>
  );
};
