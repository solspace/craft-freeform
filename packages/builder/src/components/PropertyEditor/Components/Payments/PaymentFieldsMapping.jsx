import { fetchPaymentGatewaysIfNeeded, invalidatePaymentGateways } from '@ff/builder/actions/PaymentGateways';
import * as Currencies from '@ff/builder/constants/Currencies';
import * as consts from '@ff/builder/constants/Payments';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import BasePropertyEditor from '../../BasePropertyEditor';
import CustomProperty from '../../PropertyItems/CustomProperty';
import NumberProperty from '../../PropertyItems/NumberPoperty';
import SelectProperty from '../../PropertyItems/SelectProperty';
import TextProperty from '../../PropertyItems/TextProperty';
import IntegrationMappingTable from '../IntegrationMappingTable/IntegrationMappingTable';
import AddNewPaymentPlan from '../Payments/AddNewPaymentPlan';

@connect(
  (state) => ({
    isFetching: state.paymentGateways.isFetching,
  }),
  (dispatch) => ({
    fetchPlans: () => {
      dispatch(invalidatePaymentGateways());
      dispatch(fetchPaymentGatewaysIfNeeded());
    },
  })
)
export default class PaymentFieldsMapping extends BasePropertyEditor {
  static contextTypes = {
    updateField: PropTypes.func.isRequired,
  };

  static propTypes = {
    formPaymentFields: PropTypes.arrayOf(
      PropTypes.shape({
        handle: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
      })
    ),
    integration: PropTypes.object.isRequired,
    paymentType: PropTypes.string.isRequired,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    currency: PropTypes.string,
    interval: PropTypes.string,
    description: PropTypes.string,
    plan: PropTypes.string,
    paymentFieldMapping: PropTypes.object.isRequired,
    isFetching: PropTypes.bool.isRequired,
    fetchPlans: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      isPlanHelperOpen: false,
    };
  }

  checkFixedFieldVisibility = (fieldName) => {
    const { paymentFieldMapping } = this.props;

    return this.checkFieldVisibility(fieldName) && !paymentFieldMapping[fieldName];
  };

  checkHelperFieldVisibility = (fieldName) => {
    const { paymentFieldMapping } = this.props;

    return this.checkFieldVisibility(fieldName) && paymentFieldMapping[fieldName];
  };

  checkFieldVisibility = (fieldName) => {
    return this.getPaymentFieldList().indexOf(fieldName) >= 0;
  };

  getPaymentFieldList = () => {
    const { paymentType } = this.props;
    const paymentFieldList = [];
    if (paymentType === consts.PAYMENT_TYPE_PREDEFINED_SUBSCRIPTION) {
      paymentFieldList.push(consts.PAYMENT_FIELD_PLAN);
    } else {
      paymentFieldList.push(consts.PAYMENT_FIELD_AMOUNT);
      paymentFieldList.push(consts.PAYMENT_FIELD_CURRENCY);
      if (paymentType === consts.PAYMENT_TYPE_DYNAMIC_SUBSCRIPTION) {
        paymentFieldList.push(consts.PAYMENT_FIELD_INTERVAL);
      } else {
        paymentFieldList.push(consts.PAYMENT_FIELD_DESCRIPTION);
      }
    }

    return paymentFieldList;
  };

  getPlans = () => {
    const { integration } = this.props;

    return integration.plans.map((item) => ({ key: item.resourceId, value: item.name }));
  };

  handePlanCreated = (plan) => {
    const { updateField } = this.context;
    updateField({ plan: plan });
  };

  getPaymentFields = () => {
    return this.getPaymentFieldList().map((item) => consts.PAYMENT_FIELD_MAPPING_MAP[item]);
  };

  handlePlanHelperToggle = () => {
    const { isPlanHelperOpen } = this.state;
    this.setState({ isPlanHelperOpen: !isPlanHelperOpen });
  };

  render() {
    const {
      formPaymentFields,
      paymentFieldMapping,

      amount,
      currency,
      interval,
      description,
      plan,

      fetchPlans,
      isFetching,
    } = this.props;

    const plans = this.getPlans();
    const paymentFields = this.getPaymentFields();
    const { isPlanHelperOpen } = this.state;

    return (
      <div>
        <CustomProperty
          label="Payment Field Mapping"
          instructions="Payment fields to your Freeform fields."
          content={
            <IntegrationMappingTable
              name="paymentFieldMapping"
              formFields={formPaymentFields}
              fields={paymentFields}
              mapping={paymentFieldMapping}
              mappedAttributeLabel="Payment Field"
            />
          }
        />

        {this.checkFixedFieldVisibility(consts.PAYMENT_FIELD_AMOUNT) && (
          <NumberProperty
            label="Fixed Amount"
            instructions="Fixed payment amount."
            name="amount"
            value={amount}
            onChangeHandler={this.update}
          />
        )}

        {this.checkFixedFieldVisibility(consts.PAYMENT_FIELD_CURRENCY) && (
          <SelectProperty
            label="Fixed Currency"
            instructions="Payment currency."
            name="currency"
            value={currency}
            options={Currencies.LIST}
            onChangeHandler={this.update}
          />
        )}

        {this.checkFixedFieldVisibility(consts.PAYMENT_FIELD_DESCRIPTION) && (
          <TextProperty
            label="Payment Description"
            instructions="Enter a custom payment description"
            name="description"
            value={description}
            placeholder="Payment for FF Submission #{id}"
            onChangeHandler={this.update}
          />
        )}

        {this.checkFixedFieldVisibility(consts.PAYMENT_FIELD_INTERVAL) && (
          <SelectProperty
            label="Fixed Interval"
            instructions="The frequency with which a subscription should be billed."
            name="interval"
            value={interval}
            options={consts.PLAN_INTERVAL_OPTIONS}
            onChangeHandler={this.update}
          />
        )}

        {this.checkFixedFieldVisibility(consts.PAYMENT_FIELD_PLAN) && (
          <SelectProperty
            label="Fixed Subscription Plan"
            instructions="Select one of existing subscription plans"
            emptyOption="Choose a subscription plan..."
            name="plan"
            value={plan}
            options={plans}
            onChangeHandler={this.update}
          />
        )}

        {this.checkHelperFieldVisibility(consts.PAYMENT_FIELD_PLAN) && (
          <CustomProperty
            label="Available Plans"
            instructions="Name of the plan is in bold, id of the plan is underneath it, you can place this id into select, radio option values so user could pick a plan."
            content={
              <ul className="plan-helper-list">
                <li onClick={this.handlePlanHelperToggle}>
                  <a href="#">{!isPlanHelperOpen ? 'Show all (' + plans.length + ')' : 'Hide'}</a>
                </li>
                {isPlanHelperOpen &&
                  plans.map((item, index) => (
                    <li key={index}>
                      <strong>{item.value}</strong>
                      <br />
                      {item.key}
                      <br />
                    </li>
                  ))}
              </ul>
            }
          />
        )}

        {this.checkFieldVisibility(consts.PAYMENT_FIELD_PLAN) && (
          <button className="btn download icon" onClick={fetchPlans} disabled={isFetching}>
            {isFetching ? 'Refreshing...' : 'Refresh plans'}
          </button>
        )}

        {this.checkFieldVisibility(consts.PAYMENT_FIELD_PLAN) && (
          <AddNewPaymentPlan onCreated={this.handePlanCreated} />
        )}
      </div>
    );
  }
}
