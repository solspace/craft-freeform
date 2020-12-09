import PropTypes from 'prop-types';
import React from 'react';
import { Tooltip } from 'react-tippy';
import { translate } from '../../../app';
import * as FieldTypes from '../../../constants/FieldTypes';

export const FormSettings = (props) => (
  <div className="composer-form-settings">
    <Tooltip title={translate('Form Settings')} position="bottom-start" theme="light" arrow={true}>
      <a onClick={props.editForm} className={'form-settings' + (props.hash === FieldTypes.FORM ? ' active' : '')} />
    </Tooltip>

    <Tooltip title={translate('Validation')} position="bottom-start" theme="light" arrow={true}>
      <a
        onClick={props.editValidation}
        className={'validation-settings' + (props.hash === FieldTypes.VALIDATION ? ' active' : '')}
      />
    </Tooltip>

    <Tooltip title={translate('Admin Notifications')} position="bottom-start" theme="light" arrow={true}>
      <a
        onClick={props.editAdminNotifications}
        className={'notification-settings' + (props.hash === FieldTypes.ADMIN_NOTIFICATIONS ? ' active' : '')}
      />
    </Tooltip>

    {props.isPro && props.isRulesEnabled && (
      <Tooltip title={translate('Conditional Rules')} position="bottom-start" theme="light" arrow={true}>
        <a onClick={props.editRules} className={'rules' + (props.hash === FieldTypes.RULES ? ' active' : '')} />
      </Tooltip>
    )}

    {props.isPro && (
      <Tooltip title={translate('Element Connections')} position="bottom-start" theme="light" arrow={true}>
        <a
          onClick={props.editConnections}
          className={'connection-settings' + (props.hash === FieldTypes.CONNECTIONS ? ' active' : '')}
        />
      </Tooltip>
    )}

    {props.isPro && props.crmIntegrationCount > 0 && (
      <Tooltip title={translate('CRM Integrations')} position="bottom-start" theme="light" arrow={true}>
        <a
          onClick={props.editIntegrations}
          className={'crm-settings' + (props.hash === FieldTypes.INTEGRATION ? ' active' : '')}
        />
      </Tooltip>
    )}

    {props.isPro && props.paymentGatewayCount > 0 && (
      <Tooltip title={translate('Payments')} position="bottom-start" theme="light" arrow={true}>
        <a
          onClick={props.editPayments}
          className={'payment-settings' + (props.hash === FieldTypes.PAYMENT ? ' active' : '')}
        />
      </Tooltip>
    )}
  </div>
);

FormSettings.propTypes = {
  editForm: PropTypes.func.isRequired,
  editValidation: PropTypes.func.isRequired,
  editIntegrations: PropTypes.func.isRequired,
  editAdminNotifications: PropTypes.func.isRequired,
  editPayments: PropTypes.func.isRequired,
  editConnections: PropTypes.func.isRequired,
  editRules: PropTypes.func.isRequired,
  hash: PropTypes.string.isRequired,
  crmIntegrationCount: PropTypes.number.isRequired,
  paymentGatewayCount: PropTypes.number.isRequired,
  isRulesEnabled: PropTypes.bool.isRequired,
  isPro: PropTypes.bool.isRequired,
};

export default FormSettings;
