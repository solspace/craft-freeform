import type { Card } from "@components/form-controls/control-types/namespaced/cards/cards.types";
import { useFieldOptions } from "@components/options/use-field-options";
import type { Field } from "@editor/store/slices/layout/fields";
import { useTranslations } from "@editor/store/slices/translations/translations.hooks";
import type { AssetUrlRecords } from "@ff-client/queries/assets";
import { useAssetQuery } from "@ff-client/queries/assets";
import type {
  FieldType,
  PropertyValueCollection,
} from "@ff-client/types/fields";
import { PropertyType } from "@ff-client/types/properties";
import template from "lodash/template";
import { useMemo } from "react";

export const useFieldPreview = (
  field?: Field,
  type?: FieldType,
): [string, boolean] => {
  const [generatedOptions, isFetching] = useFieldOptions(field, type);
  const { getTranslation } = useTranslations(field);
  const fetchedAssets = useAssets(field, type);

  const data: PropertyValueCollection = useMemo(() => {
    const collection: PropertyValueCollection = {};

    Object.entries(field.properties).forEach(([key, value]) => {
      const typeProperty = type?.properties.find((p) => p.handle === key);
      if (typeProperty?.translatable) {
        collection[key] = getTranslation(key, value);
      } else {
        collection[key] = value;
      }
    });

    collection.generatedOptions = generatedOptions;
    collection.fetchedAssets = fetchedAssets;

    return collection;
  }, [field, type, generatedOptions, fetchedAssets, getTranslation]);

  const compiledTemplate = useMemo(() => {
    if (
      field?.properties === undefined ||
      type?.previewTemplate === undefined
    ) {
      return "No preview available";
    }

    try {
      const compiled = template(type.previewTemplate);
      return compiled(data);
    } catch (error) {
      return `Preview template error: "${error.message}"`;
    }
  }, [field?.properties, type?.previewTemplate, data]);

  return [compiledTemplate, isFetching];
};

const useAssets = (field: Field, type: FieldType): AssetUrlRecords => {
  const assetIds = useAssetIds(field, type);
  const transform = useAssetTransform(field, type);
  const { data } = useAssetQuery(assetIds, transform);

  return data || {};
};

const useAssetIds = (field: Field, type: FieldType): number[] => {
  const fromAssetPicker = useMemo(
    () =>
      type?.properties
        .filter((prop) => prop.type === PropertyType.AssetPicker)
        .flatMap((prop) => {
          const value = field.properties[prop.handle];
          if (typeof value === "number") {
            return [value];
          }

          if (Array.isArray(value)) {
            return value.filter((v) => typeof v === "number") as number[];
          }

          return [];
        }),
    [field, type],
  );

  const fromCards = useMemo(
    () =>
      type?.properties
        .filter((prop) => prop.type === PropertyType.Cards)
        .map((prop) => {
          const value = field.properties[prop.handle];

          return value.map((card: Card) => card.assetId).filter(Boolean);
        }),
    [field, type],
  );

  return [...(fromAssetPicker || []), ...(fromCards || [])].flat();
};

const useAssetTransform = (field: Field, type: FieldType): string | undefined =>
  useMemo(() => {
    const handle = type?.properties.find(
      (prop) => prop.handle === "transform",
    )?.handle;

    return field.properties[handle];
  }, [field, type]);
