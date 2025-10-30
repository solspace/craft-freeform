import type { AttributeCollection } from '@components/form-controls/control-types/attributes/attributes.types';
import type { Card } from '@components/form-controls/control-types/namespaced/cards/cards.types';
import type { OptionsConfiguration } from '@components/form-controls/control-types/options/options.types';
import type { ColumnDescription } from '@components/form-controls/control-types/table/table.types';
import type {
  ColumnValue,
  TabularData,
} from '@components/form-controls/control-types/tabular-data/tabular-data.types';
import type { Edition } from '@config/freeform/freeform.config';

import type { FieldMapping } from './integrations';
import type { Recipient, RecipientMapping } from './notifications';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GenericValue = any;

export enum PropertyType {
  Ai = 'ai',
  AppStateSelect = 'appStateSelect',
  AssetPicker = 'assetPicker',
  Attributes = 'attributes',
  Boolean = 'bool',
  Calculation = 'calculation',
  Cards = 'cards',
  Checkboxes = 'checkboxes',
  CodeEditor = 'codeEditor',
  Color = 'color',
  ConditionalRules = 'conditionalRules',
  DateTime = 'dateTime',
  DynamicCheckboxes = 'dynamicCheckboxes',
  DynamicSelect = 'dynamicSelect',
  Field = 'field',
  FieldMapping = 'fieldMapping',
  FieldSelection = 'fieldSelection',
  FieldType = 'fieldType',
  Hidden = 'hidden',
  Integer = 'int',
  Label = 'label',
  MinMax = 'minMax',
  NotificationTemplate = 'notificationTemplate',
  OptionPicker = 'optionPicker',
  Options = 'options',
  PageButton = 'pageButton',
  PageButtonsLayout = 'pageButtonsLayout',
  RecipientMapping = 'recipientMapping',
  Recipients = 'recipients',
  SaveButton = 'saveButton',
  Select = 'select',
  String = 'string',
  Table = 'table',
  TabularData = 'tabularData',
  Textarea = 'textarea',
  WYSIWYG = 'wysiwyg',
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

export type Delimiter = {
  name?: string;
  icon?: string;
};

type BaseProperty<T, PT extends PropertyType> = {
  type: PT;
  edition: Edition;
  handle: string;
  label?: string;
  instructions?: string;
  required?: boolean;
  placeholder?: string;
  value?: T | null;
  order?: number;
  width?: number;
  disabled?: boolean;
  translatable?: boolean;
  flags?: string[];
  messages?: Message[];
  visible?: boolean;
  visibilityFilters?: VisibilityFilter[];
  delimiter?: Delimiter;
  middleware?: Middleware[];
  category?: string;
  section?: string;
  tab?: string;
  group?: string;
};

export type Message = {
  type: 'error' | 'warning' | 'info';
  message: string;
};

export type AttributeTab = {
  handle: string;
  label: string;
  previewTag: string;
};

export type AttributeProperty = BaseProperty<
  AttributeCollection,
  PropertyType.Attributes
> & {
  tabs: AttributeTab[];
};

export type AssetPickerProperty = BaseProperty<
  number[],
  PropertyType.AssetPicker
> & {
  actionLabel?: string;
  multiSelect: boolean;
  criteria: Record<string, unknown>;
  allSites: boolean;
  limit?: number;
};

export type IntegerProperty = BaseProperty<number, PropertyType.Integer> & {
  min?: number;
  max?: number;
  step?: number;
  unsigned?: boolean;
};

export type StringProperty = BaseProperty<string, PropertyType.String>;
export type HiddenProperty = BaseProperty<string, PropertyType.Hidden>;
export type TextareaProperty = BaseProperty<string, PropertyType.Textarea> & {
  rows: number;
  focus?: boolean;
};
export type BooleanProperty = BaseProperty<boolean, PropertyType.Boolean>;
export type SelectProperty = BaseProperty<string, PropertyType.Select> & {
  options: Array<Option | OptionGroup>;
  emptyOption?: string;
};
export type ButtonGroupProperty = BaseProperty<string, PropertyType.Select> & {
  options: OptionCollection;
};
export type DynamicCheckboxesProperty = BaseProperty<
  Array<string>,
  PropertyType.DynamicCheckboxes
> & {
  source?: string;
  parameterFields?: string[];
  generator?: string;
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
export type AppStateSelectProperty = BaseProperty<
  string,
  PropertyType.AppStateSelect
> & {
  emptyOption?: string;
  source?: string;
  optionValue?: string;
  optionLabel?: string;
  filters?: string[];
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

export type CardsProperty = BaseProperty<Card[], PropertyType.Cards>;

export type OptionsProperty = BaseProperty<
  OptionsConfiguration,
  PropertyType.Options
> & {
  showEmptyOption?: boolean;
  allowOptgroup?: boolean;
};
export type OptionPickerProperty = BaseProperty<
  string[],
  PropertyType.OptionPicker
>;
export type ColorProperty = BaseProperty<string, PropertyType.Color>;
export type CalculationProperty = BaseProperty<
  string,
  PropertyType.Calculation
> & {
  availableFieldTypes: string[];
};

export type FieldSelectionProperty = BaseProperty<
  string,
  PropertyType.FieldSelection
> & {
  availableFieldTypes: string[];
};

export type AiProperty = BaseProperty<string, PropertyType.Ai> & {
  availableFieldTypes: string[];
};
export type DateTimeProperty = BaseProperty<string, PropertyType.DateTime> & {
  dateFormat?: string;
  minDate?: string;
  maxDate?: string;
};
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
  layouts: string[];
  elements: Array<{
    label: string;
    value: string;
  }>;
};

export type PageButtonProperty = BaseProperty<
  { label: string; enabled: boolean },
  PropertyType.PageButton
> & { togglable: boolean; enabled: boolean };

export type SaveButtonProperty = BaseProperty<
  {
    label: string;
    enabled: boolean;
    redirectUrl: string;
    notificationId: number | string;
    emailFieldUid: string;
  },
  PropertyType.SaveButton
> & { togglable: boolean; enabled: boolean };

export type FieldMappingProperty = BaseProperty<
  FieldMapping,
  PropertyType.FieldMapping
> & {
  source?: string;
  parameterFields?: string[];
};
export type FieldTypeProperty = BaseProperty<string, PropertyType.FieldType>;

export type WYSIWYGProperty = BaseProperty<string, PropertyType.WYSIWYG> & {
  menu?: boolean;
  statusbar?: boolean;
  toolbar: string[] | boolean;
  toggleEditor?: boolean;
};
export type CodeEditorProperty = BaseProperty<
  string,
  PropertyType.CodeEditor
> & {
  language: string;
};

export type Property =
  | AiProperty
  | AppStateSelectProperty
  | AssetPickerProperty
  | AttributeProperty
  | BooleanProperty
  | CalculationProperty
  | CardsProperty
  | CheckboxesProperty
  | CodeEditorProperty
  | ColorProperty
  | ConditionalRulesProperty
  | DateTimeProperty
  | DynamicCheckboxesProperty
  | DynamicSelectProperty
  | FieldMappingProperty
  | FieldProperty
  | FieldSelectionProperty
  | FieldTypeProperty
  | HiddenProperty
  | IntegerProperty
  | LabelProperty
  | MinMaxProperty
  | NotificationTemplateProperty
  | OptionPickerProperty
  | OptionsProperty
  | PageButtonProperty
  | PageButtonsLayoutProperty
  | RecipientMappingProperty
  | RecipientsProperty
  | SaveButtonProperty
  | SelectProperty
  | StringProperty
  | TableProperty
  | TabularDataProperty
  | TextareaProperty
  | WYSIWYGProperty;

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
