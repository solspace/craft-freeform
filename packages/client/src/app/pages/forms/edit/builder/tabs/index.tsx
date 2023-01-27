import React from 'react';
import { useSelector } from 'react-redux';
import { Link, NavLink } from 'react-router-dom';
import { useAppDispatch } from '@editor/store';
import { save } from '@editor/store/actions/form';
import { selectForm, selectFormProcessing } from '@editor/store/slices/form';
import ChevronIcon from '@ff-client/assets/icons/chevron-left-solid.svg';
import { useOnKeypress } from '@ff-client/hooks/use-on-keypress';
import { useQueryFormSettings } from '@ff-client/queries/forms';
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
  const form = useSelector(selectForm);
  const processing = useSelector(selectFormProcessing);

  const { data: formSettingsData } = useQueryFormSettings();

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
        <FormName>{form.name || translate('New Form')}</FormName>
      </Heading>

      <TabsWrapper>
        <NavLink to="" end>
          {translate('Layout')}
        </NavLink>
        <NavLink to="notifications">{translate('Notifications')}</NavLink>
        <NavLink to="rules">{translate('Rules')}</NavLink>
        <NavLink to="integrations">{translate('Integrations')}</NavLink>
        {(formSettingsData || []).map((namespace) => (
          <NavLink key={namespace.handle} to={namespace.handle}>
            {translate(namespace.label)}
          </NavLink>
        ))}
      </TabsWrapper>

      <SaveButtonWrapper>
        <SaveButton
          onClick={triggerSave}
          className={`btn submit ${processing ? 'disabled' : ''}`}
        >
          {translate(processing ? 'Saving...' : 'Save')}
        </SaveButton>
      </SaveButtonWrapper>
    </TabWrapper>
  );
};
