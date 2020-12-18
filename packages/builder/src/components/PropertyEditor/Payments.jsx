import { fetchPaymentGatewaysIfNeeded, invalidatePaymentGateways } from '@ff/builder/actions/PaymentGateways';
import * as consts from '@ff/builder/constants/Payments';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import BasePropertyEditor from './BasePropertyEditor';
import IntegrationMappingTable from './Components/IntegrationMappingTable/IntegrationMappingTable';
import PaymentFieldsMapping from './Components/Payments/PaymentFieldsMapping';
import PaymentNotifications from './Components/Payments/PaymentNotifications';
import RequirePro from './Components/RequirePro';
import CustomProperty from './PropertyItems/CustomProperty';
import SelectProperty from './PropertyItems/SelectProperty';

@connect(
  (state) => ({
    hash: state.context.hash,
    composerProperties: state.composer.properties,
    paymentProperties: state.composer.properties.payment,
    paymentGatewayList: state.paymentGateways.list,
    isFetching: state.paymentGateways.isFetching,
  }),
  (dispatch) => ({
    fetchPaymentGateways: () => {
      dispatch(invalidatePaymentGateways());
      dispatch(fetchPaymentGatewaysIfNeeded());
    },
  })
)
export default class Payments extends BasePropertyEditor {
  static title = 'Payments';

  static propTypes = {
    composerProperties: PropTypes.object.isRequired,
    paymentProperties: PropTypes.object,
    paymentGatewayList: PropTypes.array.isRequired,
    fetchPaymentGateways: PropTypes.func.isRequired,
    isFetching: PropTypes.bool.isRequired,
  };

  static contextTypes = {
    ...BasePropertyEditor.contextTypes,
    properties: PropTypes.shape({
      type: PropTypes.string.isRequired,
      integrationId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      paymentNotifications: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
      paymentType: PropTypes.string,
      amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      currency: PropTypes.string,
      interval: PropTypes.string,
      description: PropTypes.string,
      plan: PropTypes.string,
      paymentFieldMapping: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
      customerFieldMapping: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    }),
    isPro: PropTypes.bool,
  };

  updatePaymentGateway = (event) => {
    const { updateField } = this.context;
    const paymentGateway = event.target;

    const integrationId = parseInt(paymentGateway.value);

    updateField({
      integrationId: integrationId ? integrationId : 0,
    });

    this.update(event);
  };

  updateNotification = (event) => {
    const { name, value } = this.preprocessTarget(event.target);
    const {
      updateField,
      properties: { paymentNotifications },
    } = this.context;

    let updatedNotifications = paymentNotifications || {};
    updatedNotifications = { ...updatedNotifications, [name]: value };

    updateField({ paymentNotifications: updatedNotifications });
  };

  getFieldsForMappings = (allowedTypes) => {
    const { composerProperties } = this.props;

    return Object.keys(composerProperties).reduce((a, key) => {
      if (!composerProperties.hasOwnProperty(key)) {
        return a;
      }

      const prop = composerProperties[key];
      if (allowedTypes.indexOf(prop.type) < 0) {
        return a;
      }

      a.push({
        handle: prop.handle,
        label: prop.label,
      });

      return a;
    }, []);
  };

  getPaymentGetawayOptions = () => {
    const { paymentGatewayList } = this.props;

    return paymentGatewayList.map((item) => {
      return {
        key: item.id,
        value: item.name,
      };
    });
  };

  preprocessMapping(mapping) {
    return Array.isArray(mapping) || !mapping ? {} : mapping;
  }

  renderProperties() {
    const {
      properties: {
        integrationId,
        paymentNotifications: sourcePaymentNotifications,
        paymentType,
        amount,
        currency,
        interval,
        description,
        plan,
        customerFieldMapping: sourceCustomerFieldMapping,
        paymentFieldMapping: sourcePaymentFieldMapping,
      },
    } = this.context;
    const { paymentGatewayList } = this.props;

    const integration = paymentGatewayList.find((item) => item.id == integrationId);
    const customerFields = integration.fields || [];
    const paymentFieldMapping = this.preprocessMapping(sourcePaymentFieldMapping);
    const customerFieldMapping = this.preprocessMapping(sourceCustomerFieldMapping);
    const paymentNotifications = this.preprocessMapping(sourcePaymentNotifications);
    const formPaymentFields = this.getFieldsForMappings(consts.PAYMENT_MAPPING_TYPES);
    const formCustomerFields = this.getFieldsForMappings(consts.CUSTOMER_MAPPING_TYPES);

    return (
      <div>
        <SelectProperty
          label="Payment Type"
          instructions="Select one of payment templates"
          emptyOption="Choose payment type..."
          name="paymentType"
          value={paymentType}
          options={consts.PAYMENT_TYPE_OPTIONS}
          onChangeHandler={this.update}
        />

        {!!paymentType && (
          <PaymentFieldsMapping
            {...{
              formPaymentFields,
              paymentFieldMapping,
              integration,
              paymentType,
              amount,
              currency,
              interval,
              description,
              plan,
            }}
          />
        )}

        <CustomProperty
          label="Customer Field Mapping"
          instructions="Payment fields to your Freeform fields."
          content={
            <IntegrationMappingTable
              name="customerFieldMapping"
              formFields={formCustomerFields}
              fields={customerFields}
              mapping={customerFieldMapping || {}}
              mappedAttributeLabel="Payment Field"
            />
          }
        />

        {paymentType && (
          <PaymentNotifications
            {...{
              paymentType,
              paymentNotifications,
              onChange: this.updateNotification,
            }}
          />
        )}
      </div>
    );
  }

  render() {
    const {
      isPro,
      properties: { integrationId },
    } = this.context;

    if (!isPro) {
      return <RequirePro />;
    }

    const { isFetching, fetchPaymentGateways } = this.props;
    const paymentGatewayOptions = this.getPaymentGetawayOptions();

    return (
      <div>
        <SelectProperty
          label="Payment Gateway"
          instructions="Choose a payment gateway."
          name="integrationId"
          value={integrationId}
          couldBeNumeric={true}
          emptyOption="Choose a payment gateway..."
          options={paymentGatewayOptions}
          onChangeHandler={this.updatePaymentGateway}
        >
          <div className="composer-add-new-template-wrapper">
            <button className="btn refresh icon" onClick={fetchPaymentGateways} disabled={isFetching}>
              {isFetching ? 'Refreshing...' : 'Refresh Payment Gateways'}
            </button>
          </div>
        </SelectProperty>

        {integrationId > 0 && this.renderProperties()}
      </div>
    );
  }
}
