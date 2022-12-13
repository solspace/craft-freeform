import React from 'react';
import { FormTagAttributeInput } from '@components/form-controls/inputs/form-tag-attribute-input';
import { modifySettings } from '@editor/store/slices/form';
import type { Attribute } from '@ff-client/types/forms';

import type { FormControlType } from '../types';

import { BaseControl } from './base-control';

export const FormTagAttribute: React.FC<FormControlType<Attribute[]>> = ({
  value,
  property,
  namespace,
  dispatch,
}) => {
  const { handle } = property;

  return (
    <BaseControl property={property}>
      <FormTagAttributeInput
        id={handle}
        value={value || []}
        onChange={(value) =>
          dispatch(
            modifySettings({
              namespace,
              key: handle,
              value,
            })
          )
        }
      />
    </BaseControl>
  );
};
