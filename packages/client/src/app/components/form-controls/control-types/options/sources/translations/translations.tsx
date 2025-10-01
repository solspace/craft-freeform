import React from 'react';
import type { Field } from '@editor/store/slices/layout/fields';
import type { OptionsProperty } from '@ff-client/types/properties';

import type { OptionsConfiguration } from '../../options.types';

import { SourceCustom } from './source.custom';
import { SourceElements } from './source.elements';

type Props = {
  value: OptionsConfiguration;
  defaultValue: string | string[];
  isMultiple: boolean;
  field: Field;
  property: OptionsProperty;
};

export const OptionsTranslatable: React.FC<Props> = (props) => {
  const { value } = props;
  switch (value.source) {
    case 'custom':
      return <SourceCustom {...props} />;

    case 'elements':
      return <SourceElements {...props} />;

    default:
      return null;
  }
};
