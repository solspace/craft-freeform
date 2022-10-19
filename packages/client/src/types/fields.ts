export enum FieldPropertyType {
  Integer = 'int',
  String = 'string',
  Boolean = 'bool',
  Select = 'select',
  Color = 'color',
}

export type PropertyMiddleware = [string, GenericValue[]?];

type BaseProperty<T> = {
  type: FieldPropertyType;
  handle: string;
  label?: string;
  instructions?: string;
  placeholder?: string;
  section?: string;
  value?: T | null;
  order: number;
  flags: string[];
  middleware: PropertyMiddleware[];
};

type IntegerProperty = BaseProperty<number> & {
  type: FieldPropertyType.Integer;
};

type StringProperty = BaseProperty<string> & {
  type: FieldPropertyType.String;
};

type BooleanProperty = BaseProperty<boolean> & {
  type: FieldPropertyType.Boolean;
};

type SelectProperty = BaseProperty<string> & {
  options: Record<string | number, string | number | boolean>;
};

type ColorProperty = BaseProperty<string> & {
  type: FieldPropertyType.Color;
};

export type FieldProperty =
  | IntegerProperty
  | StringProperty
  | BooleanProperty
  | SelectProperty
  | ColorProperty;

export type FieldType = {
  name: string;
  typeClass: string;
  type: string;
  icon?: string;
  implements: string[];
  properties: FieldProperty[];
};

export type PropertySection = {
  handle: string;
  label: string;
  order: number;
};

enum DraggableTypes {
  NewField,
  ExistingField,
}

export type DraggableField = {
  type: DraggableTypes;
};

export type GenericValue = string | number | boolean | null;

export type PropertyValueCollection = {
  label?: string;
  handle?: string;
  instructions?: string;
  required?: boolean;
  [key: string]: GenericValue | GenericValue[];
};
