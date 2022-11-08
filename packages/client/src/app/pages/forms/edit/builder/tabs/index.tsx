import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAppDispatch } from '@editor/store';
import { save } from '@editor/store/actions/form';
import ChevronIcon from '@ff-client/assets/icons/chevron-left-solid.svg';
import { useOnKeypress } from '@ff-client/hooks/use-on-keypress';
import translate from '@ff-client/utils/translations';

import {
  FormName,
  Heading,
  SaveButton,
  SaveButtonWrapper,
  TabsWrapper,
  TabWrapper,
} from './index.styles';

export const Tabs: React.FC = () => {
  const dispatch = useAppDispatch();

  const triggerSave = (): void => void dispatch(save());
  const saveOnCmdS = (event: KeyboardEvent): boolean | void => {
    if (event.key === 's') {
      const isMac = window.navigator.platform.match(/Mac/);
      if (isMac && !event.metaKey) {
        return;
      }

      if (!isMac && !event.ctrlKey) {
        return;
      }

      event.preventDefault();

      triggerSave();

      return false;
    }
  };

  useOnKeypress({ callback: saveOnCmdS, type: 'keydown' });

  return (
    <TabWrapper>
      <Heading>
        <Link to=".." title={translate('Back to form list')}>
          <ChevronIcon />
        </Link>
        <FormName>My form name</FormName>
      </Heading>

      <TabsWrapper>
        <NavLink to="" end>
          {translate('Layout')}
        </NavLink>
        <NavLink to="behavior">{translate('Behavior')}</NavLink>
        <NavLink to="notifications">{translate('Notifications')}</NavLink>
        <NavLink to="rules">{translate('Rules')}</NavLink>
        <NavLink to="integrations">{translate('Integrations')}</NavLink>
        <NavLink to="settings">{translate('Settings')}</NavLink>
      </TabsWrapper>

      <SaveButtonWrapper>
        <SaveButton onClick={triggerSave}>{translate('Save')}</SaveButton>
      </SaveButtonWrapper>
    </TabWrapper>
  );
};
