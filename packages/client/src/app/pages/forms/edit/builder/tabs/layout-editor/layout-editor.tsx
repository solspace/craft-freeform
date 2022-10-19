import React from 'react';
import { useSelector } from 'react-redux';

import { selectFocus } from '../../../store/slices/context';

import { FieldLayout } from './field-layout/field-layout';
import { FieldList } from './field-list/field-list';
import { PropertyEditor } from './property-editor/property-editor';
import { Grid } from './layout-editor.styles';

export const LayoutEditor: React.FC = () => {
  const { type } = useSelector(selectFocus);

  return (
    <Grid>
      {type === null ? <FieldList /> : <PropertyEditor />}
      <FieldLayout />
    </Grid>
  );
};
