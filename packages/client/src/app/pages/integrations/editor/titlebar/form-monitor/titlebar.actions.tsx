import { QKIntegrations } from "@ff-client/queries/integrations";
import { notifications } from "@ff-client/utils/notifications";
import translate from "@ff-client/utils/translations";
import { useQueryClient } from "@tanstack/react-query";
import type { FC } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { disableAndDeleteFormMonitor, disableFormMonitor } from "./actions";
import {
  DisableAndDeleteMonitoringModal,
  DisableMonitoringModal,
} from "./titlebar.modal";

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
  const navigate = useNavigate();
  const [showDisable, setShowDisable] = useState(false);
  const [showDisableDelete, setShowDisableDelete] = useState(false);

  const onDisableMonitoring = (): void => setShowDisable(true);

  const onDisableAndDeleteMonitoring = (): void => setShowDisableDelete(true);

  return (
    <>
      <button type="button" className="btn small" onClick={onDisableMonitoring}>
        <span>{translate("Disable Monitoring")}</span>
      </button>
      <button
        type="button"
        className="btn small"
        onClick={onDisableAndDeleteMonitoring}
      >
        <span>{translate("Disable & Delete Monitoring Data")}</span>
      </button>

      {showDisable && (
        <DisableMonitoringModal
          onClose={() => setShowDisable(false)}
          onConfirm={async () => {
            await disableFormMonitor();
            queryClient.invalidateQueries({
              queryKey: QKIntegrations.navigation,
            });
            queryClient.invalidateQueries({
              queryKey: QKIntegrations.single(Number(integration.id)),
            });
            notifications.success(translate("Monitoring disabled."));
          }}
        />
      )}

      {showDisableDelete && (
        <DisableAndDeleteMonitoringModal
          onClose={() => setShowDisableDelete(false)}
          onConfirm={async () => {
            await disableAndDeleteFormMonitor();
            queryClient.invalidateQueries({
              queryKey: QKIntegrations.navigation,
            });
            queryClient.invalidateQueries({
              queryKey: QKIntegrations.single(Number(integration.id)),
            });
            notifications.success(
              translate("Monitoring disabled and data deleted."),
            );
            navigate("/integrations", { replace: true });
          }}
        />
      )}
    </>
  );
};

export const isFormMonitor = (integration: Integration): boolean =>
  integration.type.class ===
  "Solspace\\Freeform\\Integrations\\Single\\FormMonitor\\FormMonitor";
