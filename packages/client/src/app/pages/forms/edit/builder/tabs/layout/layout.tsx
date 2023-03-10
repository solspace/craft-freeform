import React from 'react';
import { useSelector } from 'react-redux';
import { SidebarSlider } from '@components/layout/sidebar/sidebar-slider';
import { selectFocus } from '@editor/store/slices/context';

import { FieldLayout } from './field-layout/field-layout';
import { FieldList } from './field-list/field-list';
import { PropertyEditor } from './property-editor/property-editor';
import { DragContextProvider } from './drag.context';
import { Grid } from './layout.styles';

export const LayoutEditor: React.FC = () => {
  const { active } = useSelector(selectFocus);

  return (
    <DragContextProvider>
      <Grid>
        <SidebarSlider swiped={active}>
          <PropertyEditor />
          <FieldList />
        </SidebarSlider>
        <FieldLayout />
      </Grid>
    </DragContextProvider>
  );
};
