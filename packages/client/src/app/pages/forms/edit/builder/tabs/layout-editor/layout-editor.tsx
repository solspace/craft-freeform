import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { SidebarSlider } from '@components/layout/sidebar/sidebar-slider';
import { useAppDispatch } from '@editor/store';
import { selectFocus, unfocus } from '@editor/store/slices/context';

import { FieldLayout } from './field-layout/field-layout';
import { FieldList } from './field-list/field-list';
import { PropertyEditor } from './property-editor/property-editor';
import { Grid } from './layout-editor.styles';

export const LayoutEditor: React.FC = () => {
  const { active } = useSelector(selectFocus);
  const dispatch = useAppDispatch();

  const listener = (event: KeyboardEvent): void => {
    if (event.key === '27') {
      event.preventDefault();
      dispatch(unfocus());
    }
  };

  useEffect(() => {
    if (active) {
      document.addEventListener('keyup', listener);
    } else {
      document.removeEventListener('keyup', listener);
    }
  }, [active]);

  return (
    <Grid>
      <SidebarSlider swiped={active}>
        <PropertyEditor />
        <FieldList />
      </SidebarSlider>
      <FieldLayout />
    </Grid>
  );
};
