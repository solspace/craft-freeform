import type { FC } from 'react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RemoveButton } from '@components/elements/remove-button/remove';
import { QKIntegrations } from '@ff-client/queries/integrations';
import { notifications } from '@ff-client/utils/notifications';
import translate from '@ff-client/utils/translations';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import type { AuthState, Integration } from '../../integration.types';
import { Readme } from '../readme/readme';

import IconInfo from './icon.info.svg';
import IconRefresh from './icon.refresh.svg';
import IconShield from './icon.shield.svg';
import { showAuthWindow } from './titlebar.actions';
import { useAuthCheck } from './titlebar.queries';
import {
  Action,
  Actions,
  AuthChecker,
  Dot,
  ErrorList,
  Icon,
  Indicator,
  MessageBox,
  RemoveButtonWrapper,
  Title,
  VersionString,
} from './titlebar.styles.ts';

type Props = {
  integration: Integration;
};

const showAuth: Array<AuthState> = ['authorized', 'unauthorized', 'error'];
const showRefresh: Array<AuthState> = ['authorized', 'error'];

export const Titlebar: FC<Props> = ({ integration }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>('pending');
  const [errors, setErrors] = useState<string[]>([]);
  const [activeReadme, setActiveReadme] = useState(false);
  const { data, isFetching, refetch } = useAuthCheck(integration);

  useEffect(() => {
    if (isFetching) {
      setState('pending');
      setErrors([]);
    } else if (data) {
      setState(data.status);
      setErrors(data.errors || []);
    }
  }, [data, isFetching]);

  const onDelete = (): void => {
    if (
      confirm(translate('Are you sure you want to remove this integration?'))
    ) {
      axios.post(`/api/integrations/${integration.id}/delete`).then(() => {
        queryClient.invalidateQueries(QKIntegrations.navigation);
        queryClient.invalidateQueries(QKIntegrations.single(integration.id));
        navigate('/integrations');

        notifications.success(translate('Integration deleted successfully.'));
      });
    }
  };

  const hasReadme = !!integration.type.readmeContent;
  const showAuthChecker =
    integration.id &&
    integration.supported &&
    integration.implements.includes('apiIntegration');

  return (
    <>
      <Title>
        <Icon dangerouslySetInnerHTML={{ __html: integration.type.iconSvg }} />
        <span>{integration.name || integration.type.name}</span>

        {integration.type.version && (
          <VersionString>{integration.type.version}</VersionString>
        )}

        {showAuthChecker && (
          <AuthChecker>
            <Indicator className={state}>
              <Dot />
              <MessageBox>{messages[state]}</MessageBox>
            </Indicator>
            <Actions>
              {showRefresh.includes(state) && (
                <Action className="btn small" onClick={() => refetch()}>
                  <IconRefresh />
                </Action>
              )}

              {showAuth.includes(state) && (
                <Action
                  className="btn small"
                  onClick={() => showAuthWindow(integration.id, refetch)}
                >
                  <IconShield />
                  <span>{translate('Authorize')}</span>
                </Action>
              )}
            </Actions>
          </AuthChecker>
        )}

        {hasReadme && (
          <Actions>
            <Action
              className="btn small info-button"
              onClick={() => setActiveReadme(!activeReadme)}
            >
              <IconInfo />
              <span>{translate('Show Instructions')}</span>
            </Action>
          </Actions>
        )}

        {!!integration.id && integration.supported && (
          <RemoveButtonWrapper>
            <RemoveButton active={true} onClick={onDelete} />
          </RemoveButtonWrapper>
        )}
      </Title>

      {errors.length > 0 && (
        <ErrorList>
          {errors.map((error, index) => {
            try {
              const json = JSON.parse(error);
              if (json) {
                return (
                  <li key={index}>
                    <pre>{JSON.stringify(json, null, 2)}</pre>
                  </li>
                );
              }
            } catch {
              // do nothing
            }

            return <li key={index}>{error}</li>;
          })}
        </ErrorList>
      )}

      <Readme active={activeReadme} content={integration.type.readmeContent} />
    </>
  );
};

const messages: Record<AuthState, string> = {
  authorized: 'Authorized',
  unauthorized: 'Unauthorized',
  pending: 'Checking...',
  error: 'Error',
};
