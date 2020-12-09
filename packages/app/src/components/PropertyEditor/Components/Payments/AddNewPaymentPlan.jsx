import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as Currencies from '../../../../constants/Currencies';
import * as consts from '../../../../constants/Payments';
import TextProperty from '../../PropertyItems/TextProperty';
import SelectProperty from '../../PropertyItems/SelectProperty';
import { createPaymentPlan } from '../../../../actions/PaymentGateways';
import { notificator } from '../../../../app';

@connect(
  (state) => ({
    formId: state.formId,
    composerProperties: state.composer.properties,
  }),
  (dispatch) => ({
    createPaymentPlan: ($plan) => dispatch(createPaymentPlan($plan)),
  })
)
export default class AddNewPaymentPlan extends Component {
  static propTypes = {
    composerProperties: PropTypes.object.isRequired,
    createPaymentPlan: PropTypes.func.isRequired,
    onCreated: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      isOpen: false,
      name: '',
      amount: '',
      currency: Currencies.MAP.USD,
      interval: consts.PLAN_DISPLAY_INTERVAL_MONTHLY,
      isCreating: false,
    };
  }

  updateState = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  toggleForm = () => {
    const { isOpen } = this.state;
    this.setState({ isOpen: !isOpen });
  };

  validatePlan = (plan) => {
    const { name, amount, currency, interval, integrationId, formId } = plan;

    return name && parseFloat(amount) && currency && interval && parseInt(integrationId) && parseInt(formId);
  };

  createPlan = () => {
    const {
      formId,
      onCreated,
      createPaymentPlan,
      composerProperties: {
        payment: { integrationId },
      },
    } = this.props;
    const { name, amount, currency, interval } = this.state;
    const plan = { name, amount, currency, interval, integrationId, formId };

    if (!this.validatePlan(plan)) {
      notificator('error', 'All fields need to be filled to create a payment plan and form needs to be saved!');

      return;
    }

    this.setState({ isCreating: true });

    createPaymentPlan(plan).then((response) => {
      this.setState({ isOpen: false, isCreating: false });
      onCreated && onCreated(response.id);
    });
  };

  render() {
    const { name, amount, currency, interval, isOpen, isCreating } = this.state;

    if (!isOpen) {
      return (
        <button className="btn download icon" onClick={this.toggleForm}>
          {'Add new plan'}
        </button>
      );
    }

    return (
      <div className="composer-property-item field">
        <TextProperty
          label="Name"
          instructions="Subscription plan name."
          required={true}
          name="name"
          value={name}
          onChangeHandler={this.updateState}
        />

        <TextProperty
          label="Amount"
          instructions="Fixed recurring payment amount."
          required={true}
          name="amount"
          value={amount}
          onChangeHandler={this.updateState}
        />

        <SelectProperty
          label="Currency"
          instructions="Payment currency."
          required={true}
          name="currency"
          value={currency}
          options={Currencies.LIST}
          onChangeHandler={this.updateState}
        />

        <SelectProperty
          label="Interval"
          instructions="The frequency with which a subscription should be billed."
          required={true}
          name="interval"
          value={interval}
          options={consts.PLAN_INTERVAL_OPTIONS}
          onChangeHandler={this.updateState}
        />

        <button className="btn download icon" onClick={this.createPlan} disabled={isCreating}>
          {isCreating ? 'Creating...' : 'Create'}
        </button>

        {!isCreating && (
          <button className="btn download icon" onClick={this.toggleForm}>
            {'Cancel'}
          </button>
        )}
      </div>
    );
  }
}
