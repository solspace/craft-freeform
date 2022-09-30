import React from 'react';

import { FieldLayout } from './field-layout/field-layout';
import { Grid } from './layout-editor.styles';
import { FieldList } from './field-list/field-list';

export const LayoutEditor: React.FC = () => {
  return (
    <Grid>
      <FieldList />
      <FieldLayout />
    </Grid>
  );
};
