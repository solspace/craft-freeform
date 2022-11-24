import type { GenericValue } from '@ff-client/types/properties';

export type Properties = {
  name: string;
  handle: string;
  [key: string]: GenericValue;
};

export type Form = {
  id?: number;
  uid: string;
  type: string;
  properties: Properties;
};

export type Attribute = {
  index?: number;
  key: string;
  value?: string;
};

export enum EditablePropertyType {
  Integer = 'int',
  String = 'string',
  StringMultiLine = 'textarea',
  Boolean = 'bool',
  Select = 'select',
  Color = 'color',
  DateTime = 'datetime',
}

type BaseEditableProperty<T> = {
  label: string;
  handle: string;
  type: EditablePropertyType;
  instructions: string;
  category?: string;
  order: number;
  value: string | number;
  placeholder: string;
  options?: GenericValue[];
  flags: GenericValue[];
  visibilityFilters?: GenericValue[];
  middleware: GenericValue[];
  tab: string;
};

type IntegerProperty = BaseEditableProperty<number> & {
  type: EditablePropertyType.Integer;
};

type StringProperty = BaseEditableProperty<string> & {
  type: EditablePropertyType.String;
};

type StringMultiLineProperty = BaseEditableProperty<string> & {
  type: EditablePropertyType.StringMultiLine;
};

type BooleanProperty = BaseEditableProperty<boolean> & {
  type: EditablePropertyType.Boolean;
};

type SelectProperty = BaseEditableProperty<string> & {
  options: Record<string | number, string | number | boolean>;
};

type ColorProperty = BaseEditableProperty<string> & {
  type: EditablePropertyType.Color;
};

type DateTimeProperty = BaseEditableProperty<string> & {
  type: EditablePropertyType.DateTime;
};

export type EditableProperty =
  | IntegerProperty
  | StringProperty
  | StringMultiLineProperty
  | BooleanProperty
  | SelectProperty
  | ColorProperty
  | DateTimeProperty;
