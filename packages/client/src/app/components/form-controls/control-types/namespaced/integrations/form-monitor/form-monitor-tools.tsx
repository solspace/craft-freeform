import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Control } from '@components/form-controls/control';
import type { ControlType } from '@components/form-controls/types';
import { TestEmailModal } from '@ff-client/app/components/form-controls/control-types/namespaced/integrations/form-monitor/test-email-modal';
import { WarningMessage } from '@ff-client/app/components/form-controls/control-types/namespaced/integrations/form-monitor/test-email-modal.styles';
import { useMailerInfoQuery } from '@ff-client/queries/form-monitor';
import type { FormMonitorToolsProperty } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';

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
          {translate('Test Email Notifications')}
        </button>
        {isSendmail && (
          <WarningMessage>
            {translate(
              'Warning: You are using Sendmail for email delivery. Sendmail can be unreliable, and most email providers reject messages from unknown IP addresses as a spam prevention measure. This may cause emails to not reach Form Monitor\'s inbound address (inbound@test.formmonitor.com), resulting in false positive "Email Issues Detected" alerts.'
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
