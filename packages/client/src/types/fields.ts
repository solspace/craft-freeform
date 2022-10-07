export enum FieldPropertyType {
  Integer = 'int',
  String = 'string',
  Boolean = 'bool',
  Select = 'select',
  Color = 'color',
}

type BaseProperty<T> = {
  type: FieldPropertyType;
  handle: string;
  label?: string;
  instructions?: string;
  placeholder?: string;
  defaultValue?: T | null;
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
  type: string;
  class: string;
  icon?: string;
  implements: string[];
  properties: FieldProperty[];
};

enum DraggableTypes {
  NewField,
  ExistingField,
}

export type DraggableField = {
  type: DraggableTypes;
};
