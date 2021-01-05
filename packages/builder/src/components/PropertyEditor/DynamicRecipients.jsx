import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { translate } from '../../app';
import * as ExternalOptions from '../../constants/ExternalOptions';
import PropertyHelper from '../../helpers/PropertyHelper';
import BasePropertyEditor from './BasePropertyEditor';
import AddNewNotification from './Components/AddNewNotification';
import OptionTable from './Components/OptionTable/OptionTable';
import { AttributeEditorProperty } from './PropertyItems';
import CheckboxProperty from './PropertyItems/CheckboxProperty';
import CustomProperty from './PropertyItems/CustomProperty';
import ExternalOptionsProperty from './PropertyItems/ExternalOptionsProperty';
import RadioProperty from './PropertyItems/RadioProperty';
import SelectProperty from './PropertyItems/SelectProperty';
import TextareaProperty from './PropertyItems/TextareaProperty';
import TextProperty from './PropertyItems/TextProperty';

@connect((state) => ({
  hash: state.context.hash,
  properties: state.composer.properties,
  notifications: state.notifications.list,
}))
export default class DynamicRecipients extends BasePropertyEditor {
  static propTypes = {
    notifications: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  };

  static contextTypes = {
    ...BasePropertyEditor.contextTypes,
    properties: PropTypes.shape({
      type: PropTypes.string.isRequired,
      handle: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      required: PropTypes.bool,
      value: PropTypes.node,
      options: PropTypes.array,
      notificationId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      oneLine: PropTypes.bool,
      showAsRadio: PropTypes.bool,
      showAsCheckboxes: PropTypes.bool,
      source: PropTypes.string,
      target: PropTypes.node,
      configuration: PropTypes.object,
    }).isRequired,
    canManageNotifications: PropTypes.bool.isRequired,
  };

  static RENDER_AS_SELECT = 'select';
  static RENDER_AS_RADIOS = 'radios';
  static RENDER_AS_CHECKBOXES = 'checkboxes';

  render() {
    const { properties } = this.context;
    const {
      required,
      label,
      handle,
      values,
      options,
      oneLine,
      showAsRadio,
      showAsCheckboxes,
      notificationId,
      instructions,
    } = properties;
    const { source, target, configuration = {} } = properties;

    const { canManageNotifications } = this.context;
    const { notifications } = this.props;

    let renderAsValue = DynamicRecipients.RENDER_AS_SELECT;
    if (showAsRadio) {
      renderAsValue = DynamicRecipients.RENDER_AS_RADIOS;
    } else if (showAsCheckboxes) {
      renderAsValue = DynamicRecipients.RENDER_AS_CHECKBOXES;
    }

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
          label="Render as"
          value={renderAsValue}
          options={[
            { key: DynamicRecipients.RENDER_AS_SELECT, value: translate('Select') },
            { key: DynamicRecipients.RENDER_AS_RADIOS, value: translate('Radios') },
            { key: DynamicRecipients.RENDER_AS_CHECKBOXES, value: translate('Checkboxes') },
          ]}
          onChangeHandler={this.handleRenderSwap}
        />

        {renderAsValue !== DynamicRecipients.RENDER_AS_SELECT && (
          <CheckboxProperty
            label="Show all options in a single line?"
            name="oneLine"
            checked={oneLine}
            onChangeHandler={this.update}
          />
        )}

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

        <hr />

        <ExternalOptionsProperty
          showEmptyOptionInput={true}
          values={values}
          customOptions={options}
          showCustomValues={true}
          source={source}
          target={target}
          configuration={configuration}
          onChangeHandler={this.update}
          availableSources={[
            ExternalOptions.SOURCE_CUSTOM,
            ExternalOptions.SOURCE_ENTRIES,
            ExternalOptions.SOURCE_CATEGORIES,
            ExternalOptions.SOURCE_TAGS,
            ExternalOptions.SOURCE_USERS,
            ExternalOptions.SOURCE_ASSETS,
            ExternalOptions.SOURCE_COMMERCE_PRODUCTS,
          ]}
        />

        <AttributeEditorProperty />
      </div>
    );
  }

  handleRenderSwap = (event) => {
    const { value } = event.target;
    const { updateField, properties } = this.context;

    let { values } = properties;
    if (value !== DynamicRecipients.RENDER_AS_CHECKBOXES && values && values.length > 1) {
      values = [values[0]];
    }

    updateField({
      showAsRadio: value === DynamicRecipients.RENDER_AS_RADIOS,
      showAsCheckboxes: value === DynamicRecipients.RENDER_AS_CHECKBOXES,
      values,
    });
  };
}
