import type { AttributeCollection } from '@components/form-controls/control-types/attributes/attributes.types';
import type { OptionsConfiguration } from '@components/form-controls/control-types/options/options.types';
import type { ColumnDescription } from '@components/form-controls/control-types/table/table.types';
import type {
  ColumnValue,
  TabularData,
} from '@components/form-controls/control-types/tabular-data/tabular-data.types';

import type { FieldMapping } from './integrations';
import type { Recipient, RecipientMapping } from './notifications';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GenericValue = any;

export enum PropertyType {
  Attributes = 'attributes',
  Boolean = 'bool',
  Checkboxes = 'checkboxes',
  Color = 'color',
  ConditionalRules = 'conditionalRules',
  DateTime = 'dateTime',
  Field = 'field',
  FieldMapping = 'fieldMapping',
  Hidden = 'hidden',
  Integer = 'int',
  Label = 'label',
  MinMax = 'minMax',
  NotificationTemplate = 'notificationTemplate',
  Options = 'options',
  PageButton = 'pageButton',
  PageButtonsLayout = 'pageButtonsLayout',
  RecipientMapping = 'recipientMapping',
  Recipients = 'recipients',
  Select = 'select',
  DynamicSelect = 'dynamicSelect',
  String = 'string',
  Table = 'table',
  TabularData = 'tabularData',
  Textarea = 'textarea',
}

export type Middleware = [string, GenericValue[]?];
export type VisibilityFilter = string;
export type Option = {
  value: string;
  label: string;
  icon?: string | JSX.Element;
  shadowIndex?: number;
};
export type OptionGroup = {
  label: string;
  icon?: string | JSX.Element;
  children: OptionCollection;
};

export type OptionCollection = Array<Option | OptionGroup>;

type BaseProperty<T, PT extends PropertyType> = {
  type: PT;
  handle: string;
  label?: string;
  instructions?: string;
  required?: boolean;
  placeholder?: string;
  value?: T | null;
  order?: number;
  width?: number;
  flags?: string[];
  visibilityFilters?: VisibilityFilter[];
  middleware?: Middleware[];
  category?: string;
  section?: string;
  tab?: string;
  group?: string;
};

export type AttributeProperty = BaseProperty<
  AttributeCollection<PropertyKey>,
  PropertyType.Attributes
>;

export type IntegerProperty = BaseProperty<number, PropertyType.Integer> & {
  min?: number;
  max?: number;
  step?: number;
  unsigned?: boolean;
};

export type StringProperty = BaseProperty<string, PropertyType.String>;
export type HiddenProperty = BaseProperty<string, PropertyType.Hidden>;
export type TextareaProperty = BaseProperty<string, PropertyType.Textarea>;
export type BooleanProperty = BaseProperty<boolean, PropertyType.Boolean>;
export type SelectProperty = BaseProperty<string, PropertyType.Select> & {
  options: Array<Option | OptionGroup>;
  emptyOption?: string;
};
export type DynamicSelectProperty = BaseProperty<
  string,
  PropertyType.DynamicSelect
> & {
  emptyOption?: string;
  source?: string;
  parameterFields?: string[];
  generator?: string;
};
export type CheckboxesProperty = BaseProperty<
  Array<string | number>,
  PropertyType.Checkboxes
> & {
  options: Array<Option | OptionGroup>;
  selectAll?: boolean;
  columns?: number;
};

export type TableProperty = BaseProperty<
  ColumnDescription[],
  PropertyType.Table
> & {
  options: Option[];
};

export type OptionsProperty = BaseProperty<
  OptionsConfiguration,
  PropertyType.Options
>;
export type ColorProperty = BaseProperty<string, PropertyType.Color>;
export type DateTimeProperty = BaseProperty<string, PropertyType.DateTime>;
export type MinMaxProperty = BaseProperty<
  [number, number],
  PropertyType.MinMax
>;

export type TabularDataProperty = BaseProperty<
  ColumnValue[],
  PropertyType.TabularData
> & {
  configuration: TabularData;
};

export type FieldProperty = BaseProperty<string, PropertyType.Field> & {
  implements?: string[];
  emptyOption?: string;
};

export type LabelProperty = BaseProperty<string, PropertyType.Label>;

export type NotificationTemplateProperty = BaseProperty<
  string | number,
  PropertyType.NotificationTemplate
>;

export type RecipientsProperty = BaseProperty<
  Recipient[],
  PropertyType.Recipients
>;

export type ConditionalRulesProperty = BaseProperty<
  string,
  PropertyType.ConditionalRules
>;

export type RecipientMappingProperty = BaseProperty<
  RecipientMapping[],
  PropertyType.RecipientMapping
>;

export type PageButtonsLayoutProperty = BaseProperty<
  string,
  PropertyType.PageButtonsLayout
> & {
  elements: Array<{
    label: string;
    value: string;
  }>;
};

export type PageButtonProperty = BaseProperty<
  { label: string; enabled: boolean },
  PropertyType.PageButton
> & { togglable: boolean; enabled: boolean };

export type FieldMappingProperty = BaseProperty<
  FieldMapping,
  PropertyType.FieldMapping
> & {
  source?: string;
  parameterFields?: string[];
};

export type Property =
  | AttributeProperty
  | BooleanProperty
  | CheckboxesProperty
  | ColorProperty
  | ConditionalRulesProperty
  | DateTimeProperty
  | DynamicSelectProperty
  | FieldMappingProperty
  | FieldProperty
  | HiddenProperty
  | IntegerProperty
  | LabelProperty
  | MinMaxProperty
  | NotificationTemplateProperty
  | OptionsProperty
  | PageButtonProperty
  | PageButtonsLayoutProperty
  | RecipientMappingProperty
  | RecipientsProperty
  | SelectProperty
  | StringProperty
  | TableProperty
  | TabularDataProperty
  | TextareaProperty;

export type FieldType = {
  name: string;
  typeClass: string;
  type: string;
  icon?: string;
  implements: string[];
  properties: Property[];
};

export type Section = {
  handle: string;
  label: string;
  icon?: string;
  order: number;
};

enum DraggableTypes {
  NewField,
  ExistingField,
}

export type DraggableField = {
  type: DraggableTypes;
};
