import type { GenericValue } from '@ff-client/types/properties';

export type FormProperties = {
  name: string;
  handle: string;
  [key: string]: GenericValue;
};

export type Form = {
  id?: number;
  uid: string;
  type: string;
  properties: FormProperties;
};

export enum EditablePropertyType {
  Integer = 'int',
  String = 'string',
  Boolean = 'bool',
  Select = 'select',
  Color = 'color',
}

type BaseEditableProperty<T> = {
  $label: string;
  $type: EditablePropertyType;
  $instructions: string;
  $category: string;
  $order: number;
  $value: string;
  $placeholder: string;
  $options: GenericValue[];
  $flags: GenericValue[];
  $visibilityFilters: GenericValue[];
  $middleware: GenericValue[];
  $tab: string;
};

type IntegerProperty = BaseEditableProperty<number> & {
  type: EditablePropertyType.Integer;
};

type StringProperty = BaseEditableProperty<string> & {
  type: EditablePropertyType.String;
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

export type EditableProperty =
  | IntegerProperty
  | StringProperty
  | BooleanProperty
  | SelectProperty
  | ColorProperty;
