import { Fields } from "@ff-client/types/field.classes";
import type {
  FieldType,
  PropertyValueCollection,
} from "@ff-client/types/fields";
import translate from "@ff-client/utils/translations";

export type ComponentNode = {
  typeClass: string;
  label: string;
  properties?: PropertyValueCollection;
  children?: ComponentNode[];
  columns?: ComponentNode[][];
};
export type ComponentVariant = {
  id: string;
  label: string;
  root: ComponentNode;
};
export type ComponentPreset = {
  id: string;
  name: string;
  description: string;
  variants: ComponentVariant[];
};
export type ComponentFieldType = FieldType & {
  component: { root: ComponentNode; types: FieldType[] };
};

export const heading = (
  label: string,
  content: string,
  level = "h2",
): ComponentNode => ({
  typeClass: Fields.Heading,
  label,
  properties: { content: translate(content), level },
});
export const text = (label: string, content: string): ComponentNode => ({
  typeClass: Fields.RichText,
  label,
  properties: { content },
});
export const image = (label: string): ComponentNode => ({
  typeClass: Fields.Image,
  label,
});
export const section = (
  label: string,
  children: ComponentNode[],
): ComponentNode => ({
  typeClass: Fields.Layout,
  label,
  properties: {
    preset: "one",
    gap: "medium",
    mobile: "stack",
    designStyle: "form",
  },
  columns: [children],
});
export const columns = (
  label: string,
  preset: string,
  items: ComponentNode[][],
): ComponentNode => ({
  typeClass: Fields.Layout,
  label,
  properties: { preset, gap: "large", mobile: "stack", designStyle: "form" },
  columns: items,
});
