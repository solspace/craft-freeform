import React from 'react';
import { edit } from '@ff-client/app/pages/forms/edit/store/slices/fields';

import { OptionsEditor } from './options-editor/options-editor';
import { Control } from './control';
import type { ControlType } from './types';

const Options: React.FC<ControlType> = ({ field, property, dispatch }) => {
  const { handle } = property;
  const { uid, properties } = field;

  property.label = 'Options Editor';

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
