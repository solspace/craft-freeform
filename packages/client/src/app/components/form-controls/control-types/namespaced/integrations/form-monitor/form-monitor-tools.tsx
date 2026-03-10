import { Control } from "@components/form-controls/control";
import type { ControlType } from "@components/form-controls/types";
import { TestEmailModal } from "@ff-client/app/components/form-controls/control-types/namespaced/integrations/form-monitor/test-email-modal";
import { WarningMessage } from "@ff-client/app/components/form-controls/control-types/namespaced/integrations/form-monitor/test-email-modal.styles";
import { useMailerInfoQuery } from "@ff-client/queries/form-monitor";
import type { FormMonitorToolsProperty } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import type React from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";

const FormMonitorTools: React.FC<ControlType<FormMonitorToolsProperty>> = ({
  property,
  errors,
}) => {
  const { formId } = useParams();
  const [showTestEmailModal, setShowTestEmailModal] = useState(false);
  const { data: mailerInfo } = useMailerInfoQuery();

  const numericFormId = formId ? Number(formId) : null;

  const canTestEmail = !!numericFormId;
  const isSendmail = mailerInfo?.isSendmail ?? false;

  return (
    <>
      <Control property={property} errors={errors}>
        <button
          className="btn small submit"
          type="button"
          disabled={!canTestEmail}
          onClick={() => {
            if (!canTestEmail) {
              return;
            }

            setShowTestEmailModal(true);
          }}
        >
          {translate("Test Email Notifications")}
        </button>
        {isSendmail && (
          <WarningMessage>
            {translate(
              'Warning: You are currently using Sendmail for email delivery. Sendmail is often unreliable, and many email providers block messages sent from unknown servers as a spam-prevention measure. This may prevent messages from reaching Form Monitor\'s inbound address (inbound@test.formmonitor.com), which can trigger false "Email Issues Detected" alerts.',
            )}
          </WarningMessage>
        )}
      </Control>

      {showTestEmailModal && numericFormId && (
        <TestEmailModal
          formId={numericFormId}
          onClose={() => setShowTestEmailModal(false)}
        />
      )}
    </>
  );
};

export default FormMonitorTools;
