import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Tooltip } from 'react-tippy';
import { resetProperties, switchHash, updateProperty } from '../actions/Actions';
import { translate } from '../app';
import AdminNotifications from '../components/PropertyEditor/AdminNotifications';
import Checkbox from '../components/PropertyEditor/Checkbox';
import CheckboxGroup from '../components/PropertyEditor/CheckboxGroup';
import FormSettings from '../components/PropertyEditor/Components/FormSettings';
import Validation from '../components/PropertyEditor/Validation';
import Confirmation from '../components/PropertyEditor/Confirmation';
import Connections from '../components/PropertyEditor/Connections';
import CreditCardCvc from '../components/PropertyEditor/CreditCardCvc';
import CreditCardDetails from '../components/PropertyEditor/CreditCardDetails';
import CreditCardExpDate from '../components/PropertyEditor/CreditCardExpDate';
import CreditCardNumber from '../components/PropertyEditor/CreditCardNumber';
import DateTime from '../components/PropertyEditor/Datetime';
import DynamicRecipients from '../components/PropertyEditor/DynamicRecipients';
import Email from '../components/PropertyEditor/Email';
import File from '../components/PropertyEditor/File';
import Form from '../components/PropertyEditor/Form';
import Hidden from '../components/PropertyEditor/Hidden';
import Html from '../components/PropertyEditor/Html';
import Integrations from '../components/PropertyEditor/Integrations';
import Invisible from '../components/PropertyEditor/Invisible';
import MailingList from '../components/PropertyEditor/MailingList';
import MultipleSelect from '../components/PropertyEditor/MultipleSelect';
import Number from '../components/PropertyEditor/Number';
import OpinionScale from '../components/PropertyEditor/OpinionScale';
import Page from '../components/PropertyEditor/Page';
import Password from '../components/PropertyEditor/Password';
import Payments from '../components/PropertyEditor/Payments';
import Phone from '../components/PropertyEditor/Phone';
import RadioGroup from '../components/PropertyEditor/RadioGroup';
import Rating from '../components/PropertyEditor/Rating';
import Recaptcha from '../components/PropertyEditor/Recaptcha';
import Regex from '../components/PropertyEditor/Regex';
import Rules from '../components/PropertyEditor/Rules';
import Select from '../components/PropertyEditor/Select';
import Signature from '../components/PropertyEditor/Signature';
import Submit from '../components/PropertyEditor/Submit';
import Table from '../components/PropertyEditor/Table';
import Text from '../components/PropertyEditor/Text';
import Textarea from '../components/PropertyEditor/Textarea';
import Website from '../components/PropertyEditor/Website';
import RichText from '../components/PropertyEditor/RichText';
import * as FieldTypes from '../constants/FieldTypes';

const propertyTypes = {
  validation: Validation,
  admin_notifications: AdminNotifications,
  connections: Connections,
  page: Page,
  rules: Rules,
  text: Text,
  textarea: Textarea,
  hidden: Hidden,
  email: Email,
  html: Html,
  rich_text: RichText,
  submit: Submit,
  select: Select,
  multiple_select: MultipleSelect,
  checkbox: Checkbox,
  checkbox_group: CheckboxGroup,
  radio_group: RadioGroup,
  dynamic_recipients: DynamicRecipients,
  mailing_list: MailingList,
  file: File,
  datetime: DateTime,
  number: Number,
  phone: Phone,
  rating: Rating,
  website: Website,
  regex: Regex,
  confirmation: Confirmation,
  recaptcha: Recaptcha,
  password: Password,
  opinion_scale: OpinionScale,
  signature: Signature,
  table: Table,
  invisible: Invisible,
};

const crmPropertyTypes = {
  integration: Integrations,
};

const paymentPropertyTypes = {
  payment: Payments,
  cc_details: CreditCardDetails,
  cc_number: CreditCardNumber,
  cc_cvc: CreditCardCvc,
  cc_exp_date: CreditCardExpDate,
};

@connect(
  (state) => ({
    properties: state.composer.properties,
    formStatuses: state.formStatuses,
    hash: state.context.hash,
    crmIntegrationCount: state.integrations.list.length,
    paymentGatewayCount: state.paymentGateways.list.length,
    fields: state.fields.fields,
  }),
  (dispatch) => ({
    updateProperties: (hash, keyValueObject) => dispatch(updateProperty(hash, keyValueObject)),
    resetProperties: (hash, defaultProperties) => dispatch(resetProperties(hash, defaultProperties)),
    editForm: () => dispatch(switchHash(FieldTypes.FORM)),
    editValidation: () => dispatch(switchHash(FieldTypes.VALIDATION)),
    editAdminNotifications: () => dispatch(switchHash(FieldTypes.ADMIN_NOTIFICATIONS)),
    editIntegrations: () => dispatch(switchHash(FieldTypes.INTEGRATION)),
    editPayments: () => dispatch(switchHash(FieldTypes.PAYMENT)),
    editConnections: () => dispatch(switchHash(FieldTypes.CONNECTIONS)),
    editRules: () => dispatch(switchHash(FieldTypes.RULES)),
  })
)
export default class PropertyEditor extends Component {
  static propTypes = {
    properties: PropTypes.object.isRequired,
    hash: PropTypes.string.isRequired,
    updateProperties: PropTypes.func.isRequired,
    editForm: PropTypes.func.isRequired,
    editAdminNotifications: PropTypes.func.isRequired,
    editIntegrations: PropTypes.func.isRequired,
    editPayments: PropTypes.func.isRequired,
    crmIntegrationCount: PropTypes.number.isRequired,
    paymentGatewayCount: PropTypes.number.isRequired,
    editConnections: PropTypes.func.isRequired,
    editRules: PropTypes.func.isRequired,
    fields: PropTypes.array,
  };

  static contextTypes = {
    isRulesEnabled: PropTypes.bool.isRequired,
    renderHtml: PropTypes.bool.isRequired,
    isPro: PropTypes.bool.isRequired,
  };

  static childContextTypes = {
    hash: PropTypes.string.isRequired,
    properties: PropTypes.object,
    updateField: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    this.updateField = this.updateField.bind(this);
  }

  getChildContext = () => ({
    hash: this.props.hash,
    properties: this.props.properties[this.props.hash],
    updateField: this.updateField,
  });

  render() {
    const {
      hash,
      properties,
      formStatuses,
      editForm,
      editValidation,
      editAdminNotifications,
      editIntegrations,
      editConnections,
      editPayments,
      editRules,
      crmIntegrationCount,
      paymentGatewayCount,
    } = this.props;

    const { isRulesEnabled, renderHtml, isPro } = this.context;

    let title = 'Field Property Editor';

    const props = properties[hash] && properties[hash].type ? properties[hash] : { type: null };

    if (props.type === null) {
      switch (hash) {
        case FieldTypes.RULES:
          props.type = FieldTypes.RULES;
          break;
      }
    }

    let types = propertyTypes;
    if (paymentGatewayCount > 0) {
      types = Object.assign(types, paymentPropertyTypes);
    }
    if (crmIntegrationCount > 0) {
      types = Object.assign(types, crmPropertyTypes);
    }

    let form = null;
    switch (props.type) {
      case FieldTypes.FORM:
        title = 'Form Settings';
        form = <Form formStatuses={formStatuses} />;
        break;

      default:
        if (props.type && propertyTypes[props.type]) {
          let DynamicClassName = propertyTypes[props.type];
          title = DynamicClassName.title || title;

          form = <DynamicClassName />;
        }

        break;
    }

    const showReset =
      [
        FieldTypes.FORM,
        FieldTypes.VALIDATION,
        FieldTypes.INTEGRATION,
        FieldTypes.ADMIN_NOTIFICATIONS,
        FieldTypes.PAGE,
        FieldTypes.SUBMIT,
        FieldTypes.CONNECTIONS,
        FieldTypes.PAYMENT,
        FieldTypes.HTML,
        FieldTypes.MAILING_LIST,
        FieldTypes.RECAPTCHA,
        FieldTypes.PASSWORD,
        FieldTypes.CONFIRMATION,
        FieldTypes.RULES,
      ].indexOf(props.type) === -1;

    return (
      <div className="property-editor">
        <FormSettings
          editAdminNotifications={editAdminNotifications}
          editForm={editForm}
          editValidation={editValidation}
          editIntegrations={editIntegrations}
          editPayments={editPayments}
          editConnections={editConnections}
          editRules={editRules}
          hash={hash}
          crmIntegrationCount={crmIntegrationCount}
          paymentGatewayCount={paymentGatewayCount}
          isRulesEnabled={isRulesEnabled}
          isPro={isPro}
        />

        <h3>
          <span>{translate(title)}</span>

          {showReset && (
            <Tooltip title={translate('Reset to default values')} position="bottom-start" theme="light" arrow={true}>
              <button className={'btn small property-reset'} onClick={this.resetField}>
                {translate('Reset')}
              </button>
            </Tooltip>
          )}
        </h3>

        <hr />

        {!!props.label && renderHtml && <h4 dangerouslySetInnerHTML={{ __html: props.label }} />}
        {!!props.label && !renderHtml && <h4>{props.label}</h4>}

        <div className="property-wrapper">{form ? form : <p>{translate('Please select an element')}</p>}</div>
      </div>
    );
  }

  updateField = (keyValueObject) => {
    const { hash, updateProperties } = this.props;

    updateProperties(hash, keyValueObject);
  };

  resetField = () => {
    const { hash, resetProperties, fields } = this.props;

    for (const field of fields) {
      if (field.hash === hash) {
        resetProperties(hash, field);

        return;
      }
    }
  };
}
