import React from 'react';

import { FieldLayout } from './field-layout/field-layout';
import { Grid } from './layout-editor.styles';
import { Sidebar } from './sidebar/sidebar';

export const LayoutEditor: React.FC = () => {
  return (
    <Grid>
      <Sidebar />
      <FieldLayout />
    </Grid>
  );
};
