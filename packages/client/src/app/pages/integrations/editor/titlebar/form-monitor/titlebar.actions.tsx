import type { FC } from 'react';
import React, { useState } from 'react';
import { QKIntegrations } from '@ff-client/queries/integrations';
import { notifications } from '@ff-client/utils/notifications';
import translate from '@ff-client/utils/translations';
import { useQueryClient } from '@tanstack/react-query';

import { disableAndDeleteFormMonitor, disableFormMonitor } from './actions';
import {
  DisableAndDeleteMonitoringModal,
  DisableMonitoringModal,
} from './titlebar.modal';

type Integration = {
  id: string;
  type: {
    class: string;
  };
};

type Props = {
  integration: Integration;
};

export const FormMonitorTitlebarActions: FC<Props> = ({ integration }) => {
  const queryClient = useQueryClient();
  const [showDisable, setShowDisable] = useState(false);
  const [showDisableDelete, setShowDisableDelete] = useState(false);

  const onDisableMonitoring = (): void => setShowDisable(true);

  const onDisableAndDeleteMonitoring = (): void => setShowDisableDelete(true);

  return (
    <>
      <button className="btn small" onClick={onDisableMonitoring}>
        <span>{translate('Disable Monitoring')}</span>
      </button>
      <button className="btn small" onClick={onDisableAndDeleteMonitoring}>
        <span>{translate('Disable & Delete Monitoring Data')}</span>
      </button>

      {showDisable && (
        <DisableMonitoringModal
          onClose={() => setShowDisable(false)}
          onConfirm={async () => {
            await disableFormMonitor();
            queryClient.invalidateQueries(QKIntegrations.navigation);
            queryClient.invalidateQueries(
              QKIntegrations.single(Number(integration.id))
            );
            notifications.success(translate('Monitoring disabled.'));
          }}
        />
      )}

      {showDisableDelete && (
        <DisableAndDeleteMonitoringModal
          onClose={() => setShowDisableDelete(false)}
          onConfirm={async () => {
            await disableAndDeleteFormMonitor();
            queryClient.invalidateQueries(QKIntegrations.navigation);
            queryClient.invalidateQueries(
              QKIntegrations.single(Number(integration.id))
            );
            notifications.success(
              translate('Monitoring disabled and data deleted.')
            );
          }}
        />
      )}
    </>
  );
};

export const isFormMonitor = (integration: Integration): boolean =>
  integration.type.class ===
  'Solspace\\Freeform\\Integrations\\Single\\FormMonitor\\FormMonitor';
