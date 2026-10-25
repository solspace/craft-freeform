import { Fields } from "@ff-client/types/field.classes";
import type { FieldType } from "@ff-client/types/fields";
import { PropertyType } from "@ff-client/types/properties";

export const contentTypes: string[] = [
  Fields.Heading,
  Fields.RichText,
  Fields.Divider,
  Fields.Spacer,
  Fields.Callout,
  Fields.ButtonLink,
  Fields.Video,
  Fields.Icon,
  Fields.Summary,
  Fields.Image,
  Fields.Html,
];
export const catalogTypes: string[] = [
  ...contentTypes,
  Fields.Content,
  Fields.Group,
  Fields.Layout,
  Fields.LayoutColumn,
  Fields.FormSection,
  Fields.BuilderTemplate,
];
export const containerTypes: string[] = [
  Fields.Group,
  Fields.Layout,
  Fields.LayoutColumn,
  Fields.FormSection,
];
export const layoutPresets = [
  {
    value: "two",
    label: "2 columns",
    description: "Two equal areas, side by side.",
    widths: "1fr 1fr",
    count: 2,
  },
  {
    value: "three",
    label: "3 columns",
    description: "Three equal areas for your fields.",
    widths: "1fr 1fr 1fr",
    count: 3,
  },
  ...(["four", "five", "six"] as const).map((value, index) => ({
    value,
    label: `${index + 4} columns`,
    description: "Equal areas for your content.",
    widths: `repeat(${index + 4}, minmax(0, 1fr))`,
    count: index + 4,
  })),
  {
    value: "wide",
    label: "Wide + narrow",
    description: "A wider main area with a sidebar.",
    widths: "2fr 1fr",
    count: 2,
  },
  {
    value: "narrow",
    label: "Narrow + wide",
    description: "A sidebar beside a wider main area.",
    widths: "1fr 2fr",
    count: 2,
  },
  {
    value: "sidebar",
    label: "Narrow + wide + narrow",
    description: "A wider main area between two sidebars.",
    widths: "1fr 2fr 1fr",
    count: 3,
  },
  {
    value: "three-one",
    label: "3:1 columns",
    description: "A three-quarter main area with a quarter-width sidebar.",
    widths: "3fr 1fr",
    count: 2,
  },
  {
    value: "one-three",
    label: "1:3 columns",
    description: "A quarter-width sidebar beside a three-quarter main area.",
    widths: "1fr 3fr",
    count: 2,
  },
  {
    value: "one",
    label: "1 column",
    description: "One full-width area for your content.",
    widths: "1fr",
    count: 1,
  },
];
export const layoutColumnWidths = (
  presetValue: unknown,
  proportions?: unknown,
): string => {
  const preset =
    layoutPresets.find((item) => item.value === presetValue) ??
    layoutPresets[0];
  const input = String(proportions ?? "").trim();
  if (!input || input.length > 200) return preset.widths;
  const values = input.split(/[,\s]+/);
  if (
    values.length !== preset.count ||
    values.some(
      (value) =>
        !/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(value) ||
        Number(value) < 0.1 ||
        Number(value) > 100,
    )
  )
    return preset.widths;
  return values.map((value) => `minmax(0, ${Number(value)}fr)`).join(" ");
};
export const withLayoutPreset = (
  type: FieldType,
  preset: string,
): FieldType => ({
  ...type,
  name: layoutPresets.find((item) => item.value === preset)?.label ?? type.name,
  properties: type.properties.map((property) =>
    property.handle === "preset" && property.type === PropertyType.Select
      ? { ...property, value: preset }
      : property,
  ),
});
