import PropTypes from 'prop-types';
import React from 'react';
import { translate } from '../../app';
import { connect } from 'react-redux';
import PropertyHelper from '../../helpers/PropertyHelper';
import BasePropertyEditor from './BasePropertyEditor';
import AddNewNotification from './Components/AddNewNotification';
import { AttributeEditorProperty } from './PropertyItems';
import CheckboxProperty from './PropertyItems/CheckboxProperty';
import ExternalOptionsProperty from './PropertyItems/ExternalOptionsProperty';
import SelectProperty from './PropertyItems/SelectProperty';
import TextareaProperty from './PropertyItems/TextareaProperty';
import TextProperty from './PropertyItems/TextProperty';

@connect((state) => ({
  hash: state.context.hash,
  globalProperties: state.composer.properties,
  notifications: state.notifications.list,
}))
export default class Email extends BasePropertyEditor {
  static propTypes = {
    globalProperties: PropTypes.object.isRequired,
    notifications: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  };

  static contextTypes = {
    ...BasePropertyEditor.contextTypes,
    properties: PropTypes.shape({
      id: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      handle: PropTypes.string.isRequired,
      value: PropTypes.string,
      placeholder: PropTypes.string,
      required: PropTypes.bool,
      notificationId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }).isRequired,
    canManageNotifications: PropTypes.bool.isRequired,
  };

  render() {
    const {
      properties: { label, handle, placeholder, required, notificationId, instructions },
    } = this.context;

    const { canManageNotifications } = this.context;
    const { notifications } = this.props;

    return (
      <div>
        <TextProperty
          label="Handle"
          instructions="How you’ll refer to this field in the templates."
          name="handle"
          value={handle}
          onChangeHandler={this.updateHandle}
        />

        <TextProperty
          label="Label"
          instructions="Field label used to describe the field."
          name="label"
          value={label}
          onChangeHandler={this.update}
        />

        <CheckboxProperty
          label="This field is required?"
          name="required"
          checked={required}
          onChangeHandler={this.update}
        />

        <hr />

        <h4>{translate('Configuration')}</h4>

        <SelectProperty
          label="Email Template"
          instructions="The notification template used to send an email to the email value entered into this field (optional). Leave empty to just store the email address without sending anything."
          name="notificationId"
          value={notificationId}
          couldBeNumeric={true}
          onChangeHandler={this.update}
          emptyOption="Select a template..."
          optionGroups={PropertyHelper.getNotificationList(notifications)}
        >
          {canManageNotifications && <AddNewNotification />}
        </SelectProperty>

        <hr />

        <TextareaProperty
          label="Instructions"
          instructions="Field specific user instructions."
          name="instructions"
          value={instructions}
          onChangeHandler={this.update}
        />

        <TextProperty
          label="Placeholder"
          instructions="The text that will be shown if the field doesn’t have a value."
          name="placeholder"
          value={placeholder}
          onChangeHandler={this.update}
        />

        <AttributeEditorProperty />
      </div>
    );
  }
}
