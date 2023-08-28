import React from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { Breadcrumb } from '@components/breadcrumbs/breadcrumbs';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import { useAppDispatch } from '@editor/store';
import { save } from '@editor/store/actions/form';
import { State } from '@editor/store/slices/context';
import { contextSelectors } from '@editor/store/slices/context/context.selectors';
import { formSelectors } from '@editor/store/slices/form/form.selectors';
import { fieldSelectors } from '@editor/store/slices/layout/fields/fields.selectors';
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
} from './tabs.styles';

export const Tabs: React.FC = () => {
  const dispatch = useAppDispatch();
  const form = useSelector(formSelectors.current);
  const state = useSelector(contextSelectors.state);

  const formErrors = useSelector(formSelectors.errors);
  const fieldsHaveErrors = useSelector(fieldSelectors.hasErrors);
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
      <Breadcrumb label={form.name || 'New Form'} url={`/forms/${form.id}`} />

      <Heading>
        <FormName>{form.name || translate('New Form')}</FormName>
      </Heading>

      <TabsWrapper className="main-tabs">
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
        {formSettingsData && (
          <NavLink
            to="settings"
            className={classes(
              (hasErrors(formErrors?.general) ||
                hasErrors(formErrors?.behavior)) &&
                'errors'
            )}
          >
            <span>{translate('Settings')}</span>
          </NavLink>
        )}
      </TabsWrapper>

      <SaveButtonWrapper>
        <SaveButton
          onClick={triggerSave}
          disabled={state === State.Processing}
          className={classes('btn', 'submit', 'save-button')}
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
