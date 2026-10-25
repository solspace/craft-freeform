import config, { Edition } from "@config/freeform/freeform.config";
import { useFetchFieldTypes } from "@ff-client/queries/field-types";
import { useFetchGroups } from "@ff-client/queries/groups";
import { Fields } from "@ff-client/types/field.classes";
import type { FieldType } from "@ff-client/types/fields";
import { type Option, PropertyType } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import styled from "styled-components";
import { FieldItem } from "../../implementations/base-fields/field-item";
import { CatalogOptions } from "../catalog.styles";
import { CatalogPopover } from "../catalog-popover";

const templateIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 2.5h7l3 3V17.5H5z"/><path d="M12 2.5v3h3M8 9l-2 2 2 2m4-4 2 2-2 2"/></svg>';

const TemplateOptions = styled(CatalogOptions)`
  > div { min-width: 0; }
  > div > div:first-child { height: 70px; min-height: 70px; padding: 12px; }
  > div > div:nth-child(2) { min-height: 38px; }
  > div > p { margin: 5px 2px 0; line-height: 1.4; }
`;

const TemplatePreview = styled.div`
  height: 70px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 12px;
  border: 1px solid #dce5ef;
  border-radius: 4px;
  background: #f2f6fa;
  .media { width: 46px; height: 42px; flex: 0 0 46px; border-radius: 3px; background: #d6e3ef; }
  .lines { display: grid; flex: 1; min-width: 0; gap: 5px; }
  .line { height: 5px; border-radius: 3px; background: #c2d0df; }
  .line:first-child { height: 7px; width: 70%; background: #71879e; }
  .line:last-child { width: 62%; }
  &[data-kind="form"] .line:nth-child(2) { height: 15px; border: 1px solid #b3c5d7; background: white; }
  &[data-kind="text"] .line:first-child { width: 82%; height: 5px; background: #a6b8ca; }
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
              <div key={option.value}>
                <TemplatePreview
                  data-kind={details[option.value]?.preview ?? "text"}
                  aria-hidden="true"
                >
                  {details[option.value]?.preview === "media" && (
                    <span className="media" />
                  )}
                  <span className="lines">
                    <span className="line" />
                    <span className="line" />
                    <span className="line" />
                  </span>
                </TemplatePreview>
                <FieldItem
                  fieldType={withTemplate(type, option)}
                  onAdd={close}
                />
                {details[option.value]?.description && (
                  <p>{details[option.value].description}</p>
                )}
              </div>
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
