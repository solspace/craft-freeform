import type { Cell, Layout, Page, Row } from '@editor/builder/types/layout';
import type { Field } from '@editor/store/slices/fields';
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
  name: string;
  handle: string;
  settings: {
    [namespace: string]: {
      [key: string]: GenericValue;
    };
  };
};

export type ExtendedFormType = Form & {
  layout: {
    fields: Field[];
    pages: Page[];
    layouts: Layout[];
    rows: Row[];
    cells: Cell[];
  };
};

export type Attribute = {
  index?: number;
  key: string;
  value?: string;
};

export type Middleware = [string, GenericValue[]];

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
  value: T;
  placeholder: string;
  section?: string;
  options?: GenericValue[];
  flags: string[];
  visibilityFilters?: string[];
  middleware: Middleware[];
  tab?: string;
  group?: string;
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
