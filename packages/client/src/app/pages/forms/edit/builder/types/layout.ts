import type React from 'react';
import type { RefObject } from 'react';
import type { AttributeCollection } from '@components/form-controls/control-types/attributes/attributes.types';

export type Layout = {
  uid: string;
};

export type PageButton = {
  label: string;
  enabled: boolean;
  handle?: string;
};

export type PageButtons = {
  layout: string;
  attributes: AttributeCollection;
  submitLabel: string;
  back: boolean;
  backLabel: string;
  save: boolean;
  saveLabel: string;
};

export type Page = {
  uid: string;
  label: string;
  layoutUid: string;
  buttons?: PageButtons;
  order: number;
};

export type Row = {
  uid: string;
  layoutUid: string;
  order: number;
};

export type OptionRow = {
  id: string;
  dragRef?: RefObject<HTMLButtonElement>;
  onDrop?: (fromIndex: number, toIndex: number) => void;
  children?: React.ReactNode;
};
