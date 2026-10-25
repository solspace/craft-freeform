import { useAppDispatch, useAppSelector } from "@editor/store";
import { fieldSelectors } from "@editor/store/slices/layout/fields/fields.selectors";
import { Search } from "@editor/store/slices/search";
import { searchSelectors } from "@editor/store/slices/search/search.selectors";
import { fieldThunks } from "@editor/store/thunks/fields";
import { useFetchFieldTypes } from "@ff-client/queries/field-types";
import { useFetchGroups } from "@ff-client/queries/groups";
import { Fields } from "@ff-client/types/field.classes";
import type { FieldType } from "@ff-client/types/fields";
import translate from "@ff-client/utils/translations";
import type React from "react";
import { FieldItem } from "../implementations/base-fields/field-item";
import { useBaseFieldDrag } from "../implementations/base-fields/field-item.drag";
import { CatalogOptions, Catalogs } from "./catalog.styles";
import { contentTypes, layoutPresets, withLayoutPreset } from "./catalog.types";
import { CatalogPopover } from "./catalog-popover";
import { ComponentCatalog } from "./components/components";
import { LayoutOption } from "./layout-option";
import { TemplateCatalog } from "./templates/templates";

export const useContentOptions = (): FieldType[] => {
  const { data: types } = useFetchFieldTypes();
  const { data: groups } = useFetchGroups();
  if (!types || !groups) return [];
  const hidden = groups?.groups?.hidden ?? [];
  return (groups?.catalogs?.content ?? contentTypes)
    .map((typeClass) => types?.find((type) => type.typeClass === typeClass))
    .filter(
      (type): type is FieldType =>
        !!type?.visible && !hidden.includes(type.typeClass),
    );
};

const Catalog: React.FC<{ type: FieldType; options: FieldType[] }> = ({
  type,
  options,
}) => {
  const { ref } = useBaseFieldDrag(type);
  return (
    <CatalogPopover name={type.name} icon={type.icon} dragRef={ref}>
      {(close) => (
        <>
          <CatalogOptions>
            {options.map((option) => (
              <div key={`${option.typeClass}:${option.name}`}>
                <FieldItem fieldType={option} onAdd={close} />
              </div>
            ))}
          </CatalogOptions>
          <p>{translate("Click to add, or drag into your layout")}</p>
        </>
      )}
    </CatalogPopover>
  );
};

export const ContentCatalogs: React.FC = () => {
  const { data: types } = useFetchFieldTypes();
  const { data: groups } = useFetchGroups();
  const options = useContentOptions();
  const query = useAppSelector(
    searchSelectors.query(Search.Fields),
  ).toLowerCase();
  const content =
    types?.find((type) => type.typeClass === Fields.Content) ??
    (options.find((type) => type.typeClass === Fields.Html)
      ? {
          ...options.find((type) => type.typeClass === Fields.Html)!,
          name: "Content",
        }
      : undefined);
  const layout = types?.find(
    (type) =>
      type.typeClass === Fields.Layout &&
      type.visible &&
      !groups?.groups?.hidden?.includes(type.typeClass),
  );
  const group = types?.find(
    (type) =>
      type.typeClass === Fields.Group &&
      type.visible &&
      !groups?.groups?.hidden?.includes(type.typeClass),
  );
  const matching = options.filter((type) =>
    `${type.name} content`.toLowerCase().includes(query),
  );
  if (!groups) return null;
  const layoutTrigger =
    layout ?? (group ? { ...group, name: "Layout" } : undefined);
  return (
    <Catalogs>
      {content && matching.length > 0 && (
        <Catalog type={content} options={matching} />
      )}
      {layoutTrigger &&
        (!query ||
          `layout group columns ${layoutTrigger.name}`
            .toLowerCase()
            .includes(query)) && (
          <CatalogPopover name="Layout" icon={layoutTrigger.icon} wide>
            {(close) => (
              <>
                <CatalogOptions>
                  {group && (
                    <LayoutOption
                      fieldType={group}
                      description="Keep related fields together in a box."
                      close={close}
                    />
                  )}
                  {layout &&
                    [
                      ...layoutPresets.filter(
                        (preset) => preset.value === "one",
                      ),
                      ...layoutPresets.filter(
                        (preset) => preset.value !== "one" && preset.count <= 4,
                      ),
                    ].map((preset) => (
                      <LayoutOption
                        key={preset.value}
                        fieldType={withLayoutPreset(layout, preset.value)}
                        description={preset.description}
                        widths={preset.widths}
                        count={preset.count}
                        close={close}
                      />
                    ))}
                </CatalogOptions>
                <p>{translate("Click to add, or drag into your layout")}</p>
              </>
            )}
          </CatalogPopover>
        )}
      <ComponentCatalog query={query} />
      <TemplateCatalog query={query} />
      {!!query &&
        matching.map((option) => (
          <FieldItem key={option.typeClass} fieldType={option} />
        ))}
    </Catalogs>
  );
};

export const ContentChooser: React.FC<{ uid: string }> = ({ uid }) => {
  const dispatch = useAppDispatch();
  const options = useContentOptions();
  const field = useAppSelector(fieldSelectors.one(uid));
  return (
    <CatalogOptions>
      {options.map((option) => (
        <div key={option.typeClass}>
          <button
            type="button"
            className="btn"
            onClick={(event) => {
              event.stopPropagation();
              if (field) dispatch(fieldThunks.change.type(field, option));
            }}
          >
            {translate(option.name)}
          </button>
        </div>
      ))}
    </CatalogOptions>
  );
};
