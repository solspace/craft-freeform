// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GenericValue = any;

export enum PropertyType {
  Integer = 'int',
  String = 'string',
  Textarea = 'textarea',
  Boolean = 'bool',
  Select = 'select',
  Color = 'color',
  DateTime = 'date-time',
}

export type Middleware = [string, GenericValue[]?];

type BaseProperty<T> = {
  type: PropertyType;
  handle: string;
  label?: string;
  instructions?: string;
  placeholder?: string;
  value?: T | null;
  order: number;
  flags: string[];
  visibilityFilters?: string[];
  middleware: Middleware[];
  category?: string;
  section?: string;
  tab?: string;
  group?: string;
};

export type IntegerProperty = BaseProperty<number> & {
  type: PropertyType.Integer;
};

export type StringProperty = BaseProperty<string> & {
  type: PropertyType.String;
};

export type TextareaProperty = BaseProperty<string> & {
  type: PropertyType.Textarea;
  rows: number;
};

export type BooleanProperty = BaseProperty<boolean> & {
  type: PropertyType.Boolean;
};

export type Option = { value: string | number; label: string };

export type SelectProperty = BaseProperty<string> & {
  options: Option[];
};

export type ColorProperty = BaseProperty<string> & {
  type: PropertyType.Color;
};

export type DateTimeProperty = BaseProperty<string> & {
  type: PropertyType.DateTime;
};

export type Property =
  | IntegerProperty
  | StringProperty
  | TextareaProperty
  | BooleanProperty
  | SelectProperty
  | ColorProperty
  | DateTimeProperty;

export type FieldType = {
  name: string;
  typeClass: string;
  type: string;
  icon?: string;
  implements: string[];
  properties: Property[];
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
