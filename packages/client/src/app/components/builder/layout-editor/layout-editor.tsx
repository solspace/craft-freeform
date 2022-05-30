import React, { useState } from 'react';

import InputIcon from '../assets/input.svg';
import SettingsIcon from '../assets/settings.svg';
import { FieldLayout } from './field-layout/field-layout';
import { Grid } from './layout-editor.styles';
import { SideButtons } from './side-buttons/side-buttons';
import { Sidebar } from './sidebar/sidebar';

export const LayoutEditor: React.FC = () => {
  const [visible, setVisible] = useState(true);

  return (
    <Grid>
      <SideButtons>
        <SideButtons.Button onClick={(): void => setVisible(!visible)}>
          <InputIcon />
        </SideButtons.Button>
        <SideButtons.Button>
          <SettingsIcon />
        </SideButtons.Button>
        <SideButtons.Button />
      </SideButtons>
      <Sidebar visible={visible} />
      <FieldLayout />
    </Grid>
  );
};
