import type { AttributeCollection } from '@components/form-controls/control-types/attributes/attributes.types';

export type Layout = {
  uid: string;
};

enum ButtonAttributeTarget {
  Container = 'container',
  Submit = 'submit',
  Back = 'back',
  Save = 'save',
}

export type PageButtonType = 'submit' | 'back' | 'save';

export type Page = {
  uid: string;
  label: string;
  layoutUid: string;
  buttons?: {
    [key in PageButtonType]: { label: string };
  } & {
    layout: string;
    attributes: AttributeCollection<ButtonAttributeTarget>;
  };
  order: number;
};

export type Row = {
  uid: string;
  layoutUid: string;
  order: number;
};

export enum CellType {
  Field = 'field',
  Layout = 'layout',
}

export type Cell = {
  uid: string;
  type: CellType;
  rowUid: string;
  order: number;
  targetUid: string;
};
