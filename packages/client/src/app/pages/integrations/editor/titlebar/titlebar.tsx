import type { FC } from 'react';
import React, { useEffect, useState } from 'react';
import translate from '@ff-client/utils/translations';

import type { AuthState, Integration } from '../../integration.types';

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
  Title,
} from './titlebar.styles.ts';

type Props = {
  integration: Integration;
};

const showAuth: Array<AuthState> = ['authorized', 'unauthorized', 'error'];
const showRefresh: Array<AuthState> = ['authorized', 'error'];

export const Titlebar: FC<Props> = ({ integration }) => {
  const [state, setState] = useState<AuthState>('pending');
  const [errors, setErrors] = useState<string[]>([]);
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

  const showAuthChecker =
    integration.id && integration.implements.includes('apiIntegration');

  return (
    <>
      <Title>
        <Icon dangerouslySetInnerHTML={{ __html: integration.type.iconSvg }} />
        <span>{integration.name || integration.type.name}</span>

        {showAuthChecker && (
          <AuthChecker>
            <Indicator className={state}>
              <Dot />
              <MessageBox>{messages[state]}</MessageBox>
            </Indicator>
            <Actions>
              {showRefresh.includes(state) && (
                <Action className="btn small" onClick={() => refetch()}>
                  <i className="fa-solid fa-rotate-right" />
                </Action>
              )}

              {showAuth.includes(state) && (
                <Action
                  className="btn small"
                  onClick={() => showAuthWindow(integration.id, refetch)}
                >
                  <i className="fa-solid fa-shield-halved" />
                  <span>{translate('Authorize')}</span>
                </Action>
              )}
            </Actions>
          </AuthChecker>
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
    </>
  );
};

const messages: Record<AuthState, string> = {
  authorized: 'Authorized',
  unauthorized: 'Unauthorized',
  pending: 'Checking...',
  error: 'Error',
};
