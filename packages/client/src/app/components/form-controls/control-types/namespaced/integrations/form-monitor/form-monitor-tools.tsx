import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Control } from '@components/form-controls/control';
import type { ControlType } from '@components/form-controls/types';
import { TestEmailModal } from '@ff-client/app/components/form-controls/control-types/namespaced/integrations/form-monitor/test-email-modal';
import type { FormMonitorToolsProperty } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';

const FormMonitorTools: React.FC<ControlType<FormMonitorToolsProperty>> = ({
  property,
  errors,
}) => {
  const { formId } = useParams();
  const [showTestEmailModal, setShowTestEmailModal] = useState(false);

  const numericFormId = formId ? Number(formId) : null;

  const canTestEmail = !!numericFormId;

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
