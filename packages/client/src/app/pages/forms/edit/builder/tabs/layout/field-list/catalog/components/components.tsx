import config, { Edition } from "@config/freeform/freeform.config";
import {
  componentDesignAppearance,
  componentDesignTreatment,
} from "@editor/builder/tabs/layout/field-layout/layout/columns-layout/component-design";
import { useAppDispatch, useAppSelector } from "@editor/store";
import { fieldThunks } from "@editor/store/thunks/fields";
import { useFetchFieldTypes } from "@ff-client/queries/field-types";
import { useFetchGroups } from "@ff-client/queries/groups";
import { Fields } from "@ff-client/types/field.classes";
import type { FieldType } from "@ff-client/types/fields";
import translate from "@ff-client/utils/translations";
import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { useBaseFieldDrag } from "../../implementations/base-fields/field-item.drag";
import { layoutPresets } from "../catalog.types";
import { CatalogPopover } from "../catalog-popover";
import {
  availableComponents,
  type ComponentNode,
  type ComponentPreset,
  componentFieldType,
} from "./component.presets";
import {
  AddComponent,
  Arrangement,
  ComponentCard,
  ComponentGrid,
  ComponentPreview,
  ComponentSearch,
} from "./components.styles";
import { VariantSelect } from "./variant-select";

const componentsIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="2" y="2" width="7" height="7" rx="1"/><rect x="11" y="2" width="7" height="4" rx="1"/><rect x="2" y="11" width="7" height="7" rx="1"/><rect x="11" y="8" width="7" height="10" rx="1"/></svg>';

const Preview: React.FC<{ root: ComponentNode }> = ({ root }) => {
  const formDesign = useAppSelector(
    (state) => state.form.settings.general ?? {},
  );
  const design = componentDesignAppearance(root.properties ?? {}, formDesign);
  const columns = root.columns ?? [root.children ?? []];
  const widths = root.columns
    ? (layoutPresets.find((preset) => preset.value === root.properties?.preset)
        ?.widths ?? "1fr 1fr")
    : "1fr";
  return (
    <ComponentPreview
      $columns={widths}
      data-cards={root.properties?.columnStyle === "cards"}
      data-background={root.properties?.background === "image"}
      data-designed={Object.keys(design).length > 0}
      data-treatment={componentDesignTreatment(root.properties ?? {})}
      style={design as React.CSSProperties}
      aria-hidden="true"
    >
      {columns.map((nodes, column) => (
        <div key={column}>
          {nodes
            .slice(0, nodes[0]?.typeClass === Fields.Image ? 3 : 4)
            .map((node, index) =>
              node.typeClass === Fields.Image ? (
                <div className="preview-image" key={index}>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  >
                    <rect x="2" y="3" width="20" height="18" rx="2" />
                    <circle cx="8" cy="9" r="2" />
                    <path d="m3 19 6-6 4 4 4-6 5 8" />
                  </svg>
                </div>
              ) : node.typeClass === Fields.Heading ? (
                <div
                  key={index}
                  className={
                    node.properties?.textSize === "large"
                      ? "preview-number"
                      : "preview-heading"
                  }
                />
              ) : node.typeClass === Fields.Divider ? (
                <div key={index} className="preview-divider" />
              ) : node.typeClass === Fields.Icon ? (
                <div key={index} className="preview-symbol">
                  ✧
                </div>
              ) : node.typeClass === Fields.ButtonLink ||
                String(node.properties?.content ?? "").includes("<a ") ? (
                <div key={index} className="preview-button" />
              ) : (
                <div className="preview-text" key={index}>
                  <i />
                  <i />
                </div>
              ),
            )}
        </div>
      ))}
    </ComponentPreview>
  );
};

const PresetCard: React.FC<{
  preset: ComponentPreset;
  types: FieldType[];
  close: () => void;
}> = ({ preset, types, close }) => {
  const [selected, setSelected] = useState(preset.variants[0].id);
  const variant =
    preset.variants.find((variant) => variant.id === selected) ??
    preset.variants[0];
  const type = useMemo(
    () => componentFieldType(preset, variant, types),
    [preset, variant, types],
  );
  const { ref } = useBaseFieldDrag(type);
  const connect = useCallback(
    (element: HTMLButtonElement | null) => {
      ref(element);
    },
    [ref],
  );
  const dispatch = useAppDispatch();
  return (
    <ComponentCard>
      <AddComponent
        type="button"
        ref={connect}
        aria-label={translate("Add {name}", { name: translate(preset.name) })}
        onClick={() => {
          dispatch(fieldThunks.move.newField.newRow({ fieldType: type }));
          close();
        }}
      >
        <Preview root={variant.root} />
        <strong>{translate(preset.name)}</strong>
        <small>{translate(preset.description)}</small>
      </AddComponent>
      {preset.variants.length > 1 && (
        <Arrangement>
          {translate("Style")}
          <VariantSelect
            label={translate("{name} style", { name: translate(preset.name) })}
            value={variant.id}
            onChange={setSelected}
            options={preset.variants.map((variant) => ({
              value: variant.id,
              label: translate(variant.label),
            }))}
          />
        </Arrangement>
      )}
    </ComponentCard>
  );
};

const CatalogContents: React.FC<{
  presets: ComponentPreset[];
  types: FieldType[];
  close: () => void;
}> = ({ presets, types, close }) => {
  const [search, setSearch] = useState("");
  const matching = presets.filter((preset) =>
    `${translate(preset.name)} ${translate(preset.description)}`
      .toLocaleLowerCase()
      .includes(search.trim().toLocaleLowerCase()),
  );
  return (
    <>
      <ComponentSearch>
        <input
          type="search"
          aria-label={translate("Search components")}
          placeholder={translate("Search components…")}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </ComponentSearch>
      <ComponentGrid>
        {matching.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            types={types}
            close={close}
          />
        ))}
      </ComponentGrid>
      {!matching.length && (
        <p role="status">{translate("No matching components.")}</p>
      )}
      <p>
        {translate(
          "Click to add, or drag a section into your layout. Customize every part after adding.",
        )}
      </p>
    </>
  );
};

export const ComponentCatalog: React.FC<{ query: string }> = ({ query }) => {
  const { data: types } = useFetchFieldTypes();
  const { data: groups } = useFetchGroups();
  const presets = useMemo(
    () =>
      types && groups
        ? availableComponents(types, groups.groups?.hidden ?? []).filter(
            (preset) =>
              `${preset.name} ${preset.description} components`
                .toLowerCase()
                .includes(query),
          )
        : [],
    [types, groups, query],
  );
  if (!config.editions.is(Edition.Pro) || !presets.length) return null;
  return (
    <CatalogPopover name="Components" icon={componentsIcon} wide>
      {(close) => (
        <CatalogContents presets={presets} types={types} close={close} />
      )}
    </CatalogPopover>
  );
};
