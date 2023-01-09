import React from 'react';
import TableLayoutEditor from '@editor/builder/tabs/layout-editor/property-editor/form-controls/table-layout-editor';
import { edit } from '@ff-client/app/pages/forms/edit/store/slices/fields';

import { Control } from './control';
import type { ControlType } from './types';

const Table: React.FC<ControlType> = ({ field, property, dispatch }) => {
  const { handle, options } = property;
  const { uid, properties } = field;

  return (
    <Control property={property}>
      <TableLayoutEditor
        handle={handle}
        types={options}
        options={properties[handle]}
        onChange={(value) => dispatch(edit({ uid, property, value }))}
      />
    </Control>
  );
};

export default Table;
