import type React from 'react';
import type { RefObject } from 'react';
import type { AttributeCollection } from '@components/form-controls/control-types/attributes/attributes.types';

export type Layout = {
  uid: string;
};

enum ButtonAttributeTarget {
  Container = 'container',
  Column = 'column',
  Submit = 'submit',
  Back = 'back',
  Save = 'save',
}

export type PageButton = {
  label: string;
  enabled: boolean;
  handle?: string;
};

export type PageButtonType = 'submit' | 'back' | 'save';

export type Page = {
  uid: string;
  label: string;
  layoutUid: string;
  buttons?: {
    layout: string;
    attributes: AttributeCollection<ButtonAttributeTarget>;
    submit: PageButton;
    back: PageButton;
    save: PageButton;
  };
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
