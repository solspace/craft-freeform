import type { GenericValue, Property } from './properties';

export enum Implementation {
  Options = 'options',
  GeneratedOptions = 'generatedOptions',
}

export enum Type {
  Group = 'group',
  Rating = 'rating',
  OpinionScale = 'opinion-scale',
}

export type FieldType = {
  name: string;
  typeClass: string;
  type: string;
  visible: boolean;
  icon?: string;
  previewTemplate?: string;
  implements: string[];
  properties: Property[];
};

enum DraggableTypes {
  NewField,
  ExistingField,
}

export type DraggableField = {
  type: DraggableTypes;
};

export type PropertyValueCollection = {
  label?: string;
  handle?: string;
  instructions?: string;
  required?: boolean;
  [key: string]: GenericValue;
};

export type FieldBase = {
  id?: number;
  uid: string;
  label: string;
  typeClass: string;
  properties: Record<string, GenericValue>;
};

export type FieldFavorite = FieldBase;

export type FieldForm = {
  uid: string;
  name: string;
  fields: [FieldBase];
};
