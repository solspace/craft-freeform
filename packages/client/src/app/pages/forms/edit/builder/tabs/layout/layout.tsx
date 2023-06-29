import React from 'react';
import { Sidebar } from '@components/layout/sidebar/sidebar';

import { FieldLayout } from './field-layout/field-layout';
import { FieldList } from './field-list/field-list';
import { PropertyEditor } from './property-editor/property-editor';
import { DragContextProvider } from './drag.context';
import { Grid } from './layout.styles';

export const LayoutEditor: React.FC = () => {
  return (
    <DragContextProvider>
      <Grid>
        <Sidebar $noPadding>
          <PropertyEditor />
          <FieldList />
        </Sidebar>
        <FieldLayout />
      </Grid>
    </DragContextProvider>
  );
};
