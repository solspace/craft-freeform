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
  justify-content: center;
  padding: 10px 14px;
  background: #f2f6fa;
  .art { display: flex; flex-direction: column; width: 100%; height: 100%; gap: 5px; }
  .line { display: block; height: 5px; border-radius: 3px; background: #b7c8d9; }
  .line.strong { height: 7px; width: 64%; background: #58728d; }
  .line.short { width: 40%; }
  .bar { display: block; height: 10px; border-radius: 3px; background: #a5b9cc; }
  .box { display: block; border: 1px solid #b7c8d9; border-radius: 3px; background: #fff; }
  .nav-art { flex-direction: row; align-items: center; gap: 8px; padding: 10px; border-radius: 4px; background: #506e89; }
  .nav-art .bar { width: 24%; height: 8px; margin-right: auto; background: white; }
  .nav-art .line { width: 13%; height: 5px; background: #dce6ef; }
  .hero-art { justify-content: center; padding: 8px 13px; border-radius: 4px; background: #8ba2b7; }
  .hero-art .line { background: #dce6ef; }
  .hero-art .line.strong { background: white; }
  .hero-art .bar { width: 23%; height: 9px; background: #385873; }
  .cards-art { flex-direction: row; gap: 7px; }
  .cards-art .box { display: flex; flex: 1; flex-direction: column; gap: 6px; padding: 8px 6px; }
  .cards-art .box::before, .cards-art .box::after { content: ''; display: block; height: 5px; border-radius: 3px; background: #b7c8d9; }
  .cards-art .box::before { width: 70%; background: #58728d; }
  .faq-art .box { display: flex; align-items: center; justify-content: space-between; height: 13px; padding: 3px 7px; }
  .faq-art .box::before { content: ''; width: 60%; height: 4px; border-radius: 2px; background: #8ba2b7; }
  .faq-art .box::after { content: '+'; color: #58728d; font-size: 12px; line-height: 10px; }
  .footer-art { flex-direction: row; align-items: flex-start; gap: 12px; padding: 12px; border-radius: 4px; background: #435b73; }
  .footer-art .column { display: flex; flex: 1; flex-direction: column; gap: 5px; }
  .footer-art .line { width: 90%; background: #b7c8d9; }
  .footer-art .line:first-child { width: 65%; background: white; }
  .sidebar-art { flex-direction: row; gap: 12px; justify-content: center; }
  .sidebar-art .sidebar { display: flex; flex-direction: column; width: 45%; max-width: 110px; gap: 5px; padding: 6px; border: 1px solid #b7c8d9; border-radius: 4px; background: white; }
  .sidebar-art .sidebar .bar { height: 6px; }
  .sidebar-art .sidebar .line { height: 4px; }
  .sidebar-art .sidebar .box { height: 8px; background: #dce6ef; }
  .sidebar-art > .line { width: 24%; height: 5px; margin-top: 8px; }
  .media-art { flex-direction: row; gap: 10px; }
  .media-art .box { flex: 0 0 36%; background: #cbd9e6; }
  .media-art .lines { display: flex; flex: 1; flex-direction: column; gap: 6px; padding-top: 5px; }
  .form-art .box { height: 17px; }
  .code-art { flex-direction: row; align-items: center; gap: 12px; }
  .code-art .code { color: #58728d; font: 700 22px/1 monospace; }
  .code-art .lines { display: flex; flex: 1; flex-direction: column; gap: 6px; }
`;

const TemplateIllustration: React.FC<{ kind: string }> = ({ kind }) => {
  switch (kind) {
    case "navigation":
      return (
        <span className="art nav-art">
          <span className="bar" />
          <span className="line" />
          <span className="line" />
          <span className="line" />
        </span>
      );
    case "hero":
      return (
        <span className="art hero-art">
          <span className="line strong" />
          <span className="line" />
          <span className="line short" />
          <span className="bar" />
        </span>
      );
    case "cards":
      return (
        <span className="art cards-art">
          <span className="box" />
          <span className="box" />
          <span className="box" />
        </span>
      );
    case "faq":
      return (
        <span className="art faq-art">
          <span className="box" />
          <span className="box" />
          <span className="box" />
        </span>
      );
    case "footer":
      return (
        <span className="art footer-art">
          <span className="column">
            <span className="line" />
            <span className="line" />
            <span className="line" />
          </span>
          <span className="column">
            <span className="line" />
            <span className="line" />
          </span>
          <span className="column">
            <span className="line" />
            <span className="line" />
          </span>
        </span>
      );
    case "sidebar":
      return (
        <span className="art sidebar-art">
          <span className="sidebar">
            <span className="bar" />
            <span className="line" />
            <span className="box" />
            <span className="box" />
          </span>
          <span className="line" />
        </span>
      );
    case "media":
      return (
        <span className="art media-art">
          <span className="box" />
          <span className="lines">
            <span className="line strong" />
            <span className="line" />
            <span className="line short" />
          </span>
        </span>
      );
    case "form":
      return (
        <span className="art form-art">
          <span className="line strong" />
          <span className="box" />
          <span className="box" />
        </span>
      );
    case "heading":
      return (
        <span className="art">
          <span className="line strong" />
          <span className="line" />
          <span className="line short" />
        </span>
      );
    default:
      return (
        <span className="art code-art">
          <span className="code">{"</>"}</span>
          <span className="lines">
            <span className="line strong" />
            <span className="line" />
            <span className="line short" />
          </span>
        </span>
      );
  }
};

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
        <TemplateIllustration kind={preview} />
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
