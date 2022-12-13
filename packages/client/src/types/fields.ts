import type { GenericValue, Property } from './properties';

export type FieldType = {
  name: string;
  typeClass: string;
  type: string;
  icon?: string;
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
