import AddNewNotification from '@ff/builder/components/PropertyEditor/Components/AddNewNotification';
import * as FieldTypes from '@ff/builder/constants/FieldTypes';
import PropertyHelper from '@ff/builder/helpers/PropertyHelper';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import BasePropertyEditor from './BasePropertyEditor';
import PositionProperty from './Components/Submit/PositionProperty';
import { AttributeEditorProperty, CheckboxProperty } from './PropertyItems';
import SelectProperty from './PropertyItems/SelectProperty';
import TextProperty from './PropertyItems/TextProperty';

@connect((state) => ({
  properties: state.composer.properties,
  hash: state.context.hash,
  notifications: state.notifications.list,
}))
export default class Save extends BasePropertyEditor {
  static propTypes = {
    notifications: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  };

  static contextTypes = {
    ...BasePropertyEditor.contextTypes,
    hash: PropTypes.string.isRequired,
    canManageNotifications: PropTypes.bool.isRequired,
    properties: PropTypes.shape({
      type: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      position: PropTypes.string.isRequired,
      url: PropTypes.string,
      emailFieldHash: PropTypes.string,
      notificationId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }).isRequired,
  };

  constructor(props, context) {
    super(props, context);
  }

  render() {
    const {
      hash,
      canManageNotifications,
      properties: { label, position, url, emailFieldHash, notificationId },
    } = this.context;

    const { properties, notifications } = this.props;

    const emailFields = Object.entries(properties)
      .filter(([, prop]) => prop.type === FieldTypes.EMAIL)
      .map(([key, prop]) => ({
        key,
        value: prop.label,
      }));

    return (
      <div>
        <TextProperty
          label="Hash"
          instructions="Used to access this field on the frontend."
          name="handle"
          value={hash}
          className="code"
          readOnly={true}
        />

        <TextProperty
          label="Save button Label"
          instructions="The label of the Save &amp; Continue Later button."
          name="label"
          value={label}
          onChangeHandler={this.update}
        />

        <hr />

        <TextProperty
          label="Return URL"
          instructions="The URL the user will be redirected to after saving. Can use {token} and {key}."
          name="url"
          value={url}
          onChangeHandler={this.update}
        />

        <SelectProperty
          label="Target Email Field"
          instructions="The email field used to push to the mailing list."
          name="emailFieldHash"
          onChangeHandler={this.update}
          value={emailFieldHash}
          emptyOption="Select an email field..."
          options={emailFields}
        />

        {!!emailFieldHash && (
          <>
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
          </>
        )}

        <hr />

        <PositionProperty position={position} onChangeHandler={this.update} />

        <AttributeEditorProperty />
      </div>
    );
  }
}
