import React from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import { useAppDispatch } from '@editor/store';
import { save } from '@editor/store/actions/form';
import { selectState, State } from '@editor/store/slices/context';
import { selectFieldsHaveErrors } from '@editor/store/slices/fields';
import { selectForm, selectFormErrors } from '@editor/store/slices/form';
import { notificationSelectors } from '@editor/store/slices/notifications/notifications.selectors';
import { useOnKeypress } from '@ff-client/hooks/use-on-keypress';
import { useQueryFormSettings } from '@ff-client/queries/forms';
import classes from '@ff-client/utils/classes';
import { hasErrors } from '@ff-client/utils/errors';
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
  const state = useSelector(selectState);

  const formErrors = useSelector(selectFormErrors);
  const fieldsHaveErrors = useSelector(selectFieldsHaveErrors);
  const notificationsHaveErrors = useSelector(notificationSelectors.errors.any);

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
        <FormName>{form.name || translate('New Form')}</FormName>
      </Heading>

      <TabsWrapper>
        <NavLink to="" end className={classes(fieldsHaveErrors && 'errors')}>
          <span>{translate('Layout')}</span>
        </NavLink>
        <NavLink
          to="notifications"
          className={classes(notificationsHaveErrors && 'errors')}
        >
          <span>{translate('Notifications')}</span>
        </NavLink>
        <NavLink to="rules">
          <span>{translate('Rules')}</span>
        </NavLink>
        <NavLink to="integrations">
          <span>{translate('Integrations')}</span>
        </NavLink>
        {(formSettingsData || []).map((namespace) => (
          <NavLink
            key={namespace.handle}
            to={namespace.handle}
            className={classes(
              hasErrors(formErrors?.[namespace.handle]) && 'errors'
            )}
          >
            <span>{translate(namespace.label)}</span>
          </NavLink>
        ))}
      </TabsWrapper>

      <SaveButtonWrapper>
        <SaveButton
          onClick={triggerSave}
          disabled={state === State.Processing}
          className={classes('btn', 'submit')}
        >
          <LoadingText
            loadingText={translate('Saving')}
            loading={state === State.Processing}
            spinner
          >
            {translate('Save')}
          </LoadingText>
        </SaveButton>
      </SaveButtonWrapper>
    </TabWrapper>
  );
};
