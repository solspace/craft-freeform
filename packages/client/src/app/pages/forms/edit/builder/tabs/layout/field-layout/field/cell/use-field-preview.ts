import type { Card } from "@components/form-controls/control-types/namespaced/cards/cards.types";
import { useFieldOptions } from "@components/options/use-field-options";
import {
  optionSampleRange,
  selectOptionSample,
} from "@editor/builder/sample-data/option-sample-data";
import type { SampleGenerator } from "@editor/builder/sample-data/sample-data";
import {
  useSampleData,
  useSamplePreview,
} from "@editor/builder/sample-data/sample-data.context";
import {
  selectSampleFile,
  selectSampleFiles,
} from "@editor/builder/sample-data/sample-files";
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

const emptyAssets: AssetUrlRecords = {};
const compiledTemplates = new WeakMap<
  FieldType,
  { source: string; render: ReturnType<typeof template> }
>();

const compilePreview = (type: FieldType): ReturnType<typeof template> => {
  const source = type.previewTemplate ?? "";
  const cached = compiledTemplates.get(type);
  if (cached?.source === source) return cached.render;
  const render = template(source);
  compiledTemplates.set(type, { source, render });
  return render;
};

export const useFieldPreview = (
  field?: Field,
  type?: FieldType,
): [string, boolean, SampleGenerator?] => {
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

  const sample = useSamplePreview(data.defaultValue);
  const { optionRevision } = useSampleData();
  const multiple = type?.implements?.includes("multiValue") ?? false;
  const optionSampleEnabled =
    data.sampleData === true &&
    (type?.implements?.includes("options") ?? false);
  const [minimum, maximum] = optionSampleRange(data);
  const optionSample = useMemo(() => {
    // A refresh changes this dependency without changing the saved field defaults.
    void optionRevision;
    return optionSampleEnabled
      ? selectOptionSample(generatedOptions, multiple, [minimum, maximum])
      : undefined;
  }, [
    optionSampleEnabled,
    generatedOptions,
    multiple,
    minimum,
    maximum,
    optionRevision,
  ]);
  const optionMarker = useMemo(
    () =>
      optionSampleEnabled
        ? {
            id: "options",
            label: multiple ? "Random options" : "Random option",
            value: "",
          }
        : undefined,
    [optionSampleEnabled, multiple],
  );
  const fileSamples = useMemo(() => {
    if (data.sampleData !== true || !["file", "file-dnd"].includes(type?.type))
      return [];
    if (type.type === "file-dnd")
      return selectSampleFiles(
        data.fileKinds,
        data.maxFileSizeKB,
        data.fileCount,
      );
    const file = selectSampleFile(data.fileKinds, data.maxFileSizeKB);
    return file ? [file] : [];
  }, [
    data.sampleData,
    data.fileKinds,
    data.maxFileSizeKB,
    data.fileCount,
    type?.type,
  ]);
  const fileSample = fileSamples[0];
  const fileMarker = useMemo(
    () =>
      fileSample
        ? {
            id: `file:${fileSample.kind}`,
            label: "Sample file",
            value: fileSample.name,
          }
        : undefined,
    [fileSample],
  );
  const previewData = useMemo(
    () =>
      fileSample
        ? { ...data, sampleFile: fileSample, sampleFiles: fileSamples }
        : optionSampleEnabled
          ? { ...data, defaultValue: optionSample }
          : sample
            ? { ...data, defaultValue: sample.value }
            : data,
    [data, sample, optionSampleEnabled, optionSample, fileSample, fileSamples],
  );

  const compiledTemplate = useMemo(() => {
    if (
      field?.properties === undefined ||
      type?.previewTemplate === undefined
    ) {
      return "No preview available";
    }

    try {
      const compiled = compilePreview(type);
      return compiled(previewData);
    } catch (error) {
      return `Preview template error: "${error.message}"`;
    }
  }, [field?.properties, type, previewData]);

  return [compiledTemplate, isFetching, fileMarker ?? optionMarker ?? sample];
};

const useAssets = (field: Field, type: FieldType): AssetUrlRecords => {
  const assetIds = useAssetIds(field, type);
  const transform = useAssetTransform(field, type);
  const { data } = useAssetQuery(assetIds, transform);

  return data || emptyAssets;
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

  return useMemo(
    () => [...(fromAssetPicker || []), ...(fromCards || [])].flat(),
    [fromAssetPicker, fromCards],
  );
};

const useAssetTransform = (field: Field, type: FieldType): string | undefined =>
  useMemo(() => {
    const handle = type?.properties.find(
      (prop) => prop.handle === "transform",
    )?.handle;

    return field.properties[handle];
  }, [field, type]);
