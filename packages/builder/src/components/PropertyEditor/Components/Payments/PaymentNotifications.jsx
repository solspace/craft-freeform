import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as consts from '../../../../constants/Payments';
import SelectProperty from '../../PropertyItems/SelectProperty';
import PropertyHelper from '../../../../helpers/PropertyHelper';
import AddNewNotification from '../AddNewNotification';

@connect((state) => ({
  notifications: state.notifications.list,
}))
export default class PaymentNotifications extends Component {
  static propTypes = {
    paymentType: PropTypes.string.isRequired,
    notifications: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  };

  static contextTypes = {
    canManageNotifications: PropTypes.bool.isRequired,
  };

  render() {
    const { notifications, paymentType, paymentNotifications, onChange } = this.props;
    const { canManageNotifications } = this.context;

    const notificationTypeOptions =
      paymentType == consts.PAYMENT_TYPE_SINGLE ? consts.PAYMENT_NOTIFICATIONS : consts.SUBSCRIPTION_NOTIFICATIONS;

    return (
      <div>
        {notificationTypeOptions.map((item, index) => (
          <SelectProperty
            key={index}
            label={item.value}
            instructions="The notification template used to send an email to the email value entered into this field (optional)."
            name={item.key}
            value={paymentNotifications[item.key]}
            couldBeNumeric={false}
            onChangeHandler={onChange}
            emptyOption="Select a template..."
            optionGroups={PropertyHelper.getNotificationList(notifications)}
          >
            {canManageNotifications && index + 1 == notificationTypeOptions.length && <AddNewNotification />}
          </SelectProperty>
        ))}
      </div>
    );
  }
}
