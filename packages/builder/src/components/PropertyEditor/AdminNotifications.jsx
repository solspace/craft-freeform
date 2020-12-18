import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import PropertyHelper from '../../helpers/PropertyHelper';
import BasePropertyEditor from './BasePropertyEditor';
import AddNewNotification from './Components/AddNewNotification';
import SelectProperty from './PropertyItems/SelectProperty';
import TextareaProperty from './PropertyItems/TextareaProperty';

@connect((state) => ({
  hash: state.context.hash,
  globalProperties: state.composer.properties,
  notifications: state.notifications.list,
}))
export default class AdminNotifications extends BasePropertyEditor {
  static title = 'Admin Notifications';

  static propTypes = {
    globalProperties: PropTypes.object.isRequired,
    notifications: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  };

  static contextTypes = {
    ...BasePropertyEditor.contextTypes,
    properties: PropTypes.shape({
      type: PropTypes.string.isRequired,
      notificationId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      recipients: PropTypes.string.isRequired,
    }).isRequired,
    canManageNotifications: PropTypes.bool.isRequired,
  };

  render() {
    const {
      properties: { notificationId, recipients },
    } = this.context;

    const { canManageNotifications } = this.context;

    const { notifications } = this.props;

    return (
      <div>
        <SelectProperty
          label="Email Template"
          instructions="The notification template used to send an email to the email value entered into this field (optional)."
          name="notificationId"
          value={notificationId}
          couldBeNumeric={true}
          onChangeHandler={this.update}
          emptyOption="Select a template..."
          optionGroups={PropertyHelper.getNotificationList(notifications)}
        >
          {canManageNotifications && <AddNewNotification />}
        </SelectProperty>

        {notificationId ? (
          <TextareaProperty
            label="Admin Recipients"
            instructions="Email address(es) to receive an email notification. Enter each on a new line."
            name="recipients"
            rows={10}
            value={recipients}
            onChangeHandler={this.update}
          />
        ) : (
          ''
        )}
      </div>
    );
  }
}
