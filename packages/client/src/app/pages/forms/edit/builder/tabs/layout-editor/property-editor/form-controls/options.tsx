import React from 'react';
import { edit } from '@ff-client/app/pages/forms/edit/store/slices/fields';

import { Control } from './control';
import OptionsEditor from './options-editor';
import type { ControlType } from './types';

const Options: React.FC<ControlType> = ({ field, property, dispatch }) => {
  const { handle } = property;
  const { uid, properties } = field;

  return (
    <Control property={property}>
      <OptionsEditor
        handle={handle}
        value={properties[handle]}
        onChange={(value) => dispatch(edit({ uid, property, value }))}
      />
    </Control>
  );
};

export default Options;
