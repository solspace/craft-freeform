import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import * as FieldTypes from '../../constants/FieldTypes';
import { getHandleValue } from '../../helpers/Utilities';
import BasePropertyEditor from './BasePropertyEditor';
import AddNewTemplate from './Components/AddNewTemplate';
import { CustomProperty, MatrixEditorProperty } from './PropertyItems';
import CheckboxProperty from './PropertyItems/CheckboxProperty';
import ColorProperty from './PropertyItems/ColorProperty';
import SelectProperty from './PropertyItems/SelectProperty';
import TextareaProperty from './PropertyItems/TextareaProperty';
import TextProperty from './PropertyItems/TextProperty';
import { attributeColumns } from './PropertyItems/AttributeEditorProperty';

@connect((state) => ({
  solspaceTemplates: state.templates.solspaceTemplates,
  templates: state.templates.list,
  composerProperties: state.composer.properties,
  currentFormHandle: state.composer.properties.form.handle,
  formId: state.formId,
}))
export default class Form extends BasePropertyEditor {
  static title = 'Form Settings';

  static propTypes = {
    formStatuses: PropTypes.array.isRequired,
    solspaceTemplates: PropTypes.array.isRequired,
    templates: PropTypes.array.isRequired,
    composerProperties: PropTypes.object.isRequired,
    currentFormHandle: PropTypes.string,
  };

  static contextTypes = {
    ...BasePropertyEditor.contextTypes,
    properties: PropTypes.shape({
      name: PropTypes.string.isRequired,
      handle: PropTypes.string.isRequired,
      submissionTitleFormat: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      storeData: PropTypes.bool,
      ipCollectingEnabled: PropTypes.bool,
      defaultStatus: PropTypes.number.isRequired,
      returnUrl: PropTypes.string.isRequired,
      extraPostUrl: PropTypes.string,
      extraPostTriggerPhrase: PropTypes.string,
      formTemplate: PropTypes.string,
      optInDataStorageTargetHash: PropTypes.string,
      ajaxEnabled: PropTypes.bool,
      recaptchaEnabled: PropTypes.bool,
      gtmEnabled: PropTypes.bool,
      gtmId: PropTypes.string,
      gtmEventName: PropTypes.string,
    }).isRequired,
    canManageSettings: PropTypes.bool.isRequired,
    isDefaultTemplates: PropTypes.bool.isRequired,
    isPro: PropTypes.bool.isRequired,
    isInvisibleRecaptchaSetUp: PropTypes.bool.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    this.handleTitleUpdate = this.handleTitleUpdate.bind(this);
    this.getCheckboxFields = this.getCheckboxFields.bind(this);
  }

  render() {
    const { properties, isDefaultTemplates } = this.context;
    const {
      name,
      handle,
      submissionTitleFormat,
      defaultStatus,
      returnUrl,
      extraPostUrl,
      extraPostTriggerPhrase,
      description,
      formTemplate,
      color,
      optInDataStorageTargetHash,
      tagAttributes = [],
      storeData = true,
      ipCollectingEnabled = true,
      ajaxEnabled = false,
      recaptchaEnabled = true,
    } = properties;

    const { gtmEnabled = false, gtmId = '', gtmEventName = '' } = properties;

    const { formStatuses, solspaceTemplates, templates, composerProperties } = this.props;
    const { canManageSettings, isPro, isInvisibleRecaptchaSetUp } = this.context;

    let hasPaymentField = false;
    for (const [key, value] of Object.entries(composerProperties)) {
      if (value.type === FieldTypes.CREDIT_CARD_DETAILS) {
        hasPaymentField = true;
        break;
      }
    }

    const solspaceTemplateList = [];
    solspaceTemplates.map((item, i) => {
      solspaceTemplateList.push({
        key: item.fileName,
        value: item.name,
      });
    });

    const templateList = [];
    templates.map((item) => {
      templateList.push({
        key: item.fileName,
        value: item.name,
      });
    });

    let optionGroups = [];
    if (isDefaultTemplates || !templateList.length) {
      optionGroups.push({
        label: 'Solspace Templates',
        options: solspaceTemplateList,
      });
    }

    optionGroups.push({
      label: 'Custom Templates',
      options: templateList,
    });

    const statusOptions = [];
    formStatuses.map((status) => {
      statusOptions.push({
        key: status.id,
        value: status.name,
      });
    });

    return (
      <div>
        <TextProperty
          label="Name"
          instructions="Name or title of the form."
          name="name"
          required={true}
          value={name}
          onChangeHandler={this.handleTitleUpdate}
        />

        <TextProperty
          label="Handle"
          instructions="How you’ll refer to this form in the templates."
          name="handle"
          required={true}
          value={handle}
          onChangeHandler={this.updateHandle}
        />

        <TextProperty
          label="Submission Title"
          instructions="What the auto-generated submission titles should look like."
          name="submissionTitleFormat"
          required={true}
          value={submissionTitleFormat}
          onChangeHandler={this.update}
        />

        <TextProperty
          label="Return URL"
          instructions="The URL the form will redirect to after successful submit."
          name="returnUrl"
          value={returnUrl}
          onChangeHandler={this.update}
        />

        <SelectProperty
          label="Default Status"
          instructions="The default status to be assigned to new submissions."
          name="defaultStatus"
          required={true}
          value={defaultStatus}
          onChangeHandler={this.update}
          isNumeric={true}
          options={statusOptions}
        />

        <SelectProperty
          label="Formatting Template"
          instructions="The formatting template to assign to this form when using Render method (optional)."
          name="formTemplate"
          value={formTemplate}
          onChangeHandler={this.update}
          optionGroups={optionGroups}
          emptyOption="-"
        >
          {canManageSettings && <AddNewTemplate />}
        </SelectProperty>

        <hr />

        <CheckboxProperty
          label="Enable AJAX"
          bold={true}
          instructions="Use Freeform's built-in automatic AJAX submit feature."
          name="ajaxEnabled"
          checked={ajaxEnabled}
          onChangeHandler={this.update}
        />

        {isInvisibleRecaptchaSetUp && !hasPaymentField && (
          <CheckboxProperty
            label="Enable reCAPTCHA"
            bold={true}
            instructions="Disabling this option removes the reCAPTCHA check for this specific form."
            name="recaptchaEnabled"
            checked={recaptchaEnabled}
            onChangeHandler={this.update}
          />
        )}

        <CheckboxProperty
          label="Collect IP Addresses"
          bold={true}
          instructions="Should this form collect the user's IP address?"
          name="ipCollectingEnabled"
          checked={ipCollectingEnabled}
          onChangeHandler={this.update}
        />

        <CheckboxProperty
          label="Store Submitted Data"
          bold={true}
          instructions="Should the submission data for this form be stored in the database?"
          name="storeData"
          checked={storeData}
          onChangeHandler={this.update}
        />

        <SelectProperty
          label="Opt-In Data Storage Checkbox"
          instructions="Allow users to decide whether the submission data is saved to your site or not."
          name="optInDataStorageTargetHash"
          value={optInDataStorageTargetHash}
          emptyOption="Disabled"
          onChangeHandler={this.update}
          nullable={true}
          options={this.getCheckboxFields()}
        />

        {ajaxEnabled && (
          <>
            <hr />

            <CheckboxProperty
              label="Google Tag Manager"
              instructions="Enable Google Tag Manager to push successful form submission events to the Data Layer"
              bold={true}
              name="gtmEnabled"
              checked={gtmEnabled}
              onChangeHandler={this.update}
            />

            {gtmEnabled && (
              <>
                <TextProperty
                  label="Event Name"
                  instructions="Specify a custom event name that you wish to assign to a successful form submission."
                  placeholder="form-submitted"
                  name="gtmEventName"
                  value={gtmEventName}
                  onChangeHandler={this.update}
                />

                <TextProperty
                  label="GTM Account ID (optional)"
                  instructions="Add this if you want Google Tag Manager scripts added to your page by Freeform. Leave blank if you are adding your own GTM scripts."
                  placeholder="GTM-XXXXXXX"
                  name="gtmId"
                  value={gtmId}
                  onChangeHandler={this.update}
                />
              </>
            )}
          </>
        )}

        <hr />

        <CustomProperty
          label="Form tag Attributes"
          instructions="Add any tag attributes to the HTML element."
          content={
            <MatrixEditorProperty
              hash={'form'}
              attribute={'tagAttributes'}
              columns={attributeColumns}
              values={tagAttributes}
            />
          }
        />

        <hr />

        <ColorProperty
          label="Form Color"
          instructions="Used for Widget Charts"
          name="color"
          value={color}
          onChangeHandler={this.updateKeyValue}
        />

        <TextareaProperty
          label="Description / Notes"
          instructions="Description or notes for this form."
          name="description"
          value={description}
          onChangeHandler={this.update}
        />

        {isPro && (
          <div>
            <hr />

            <TextProperty
              label="POST Forwarding"
              instructions="If you need to have the POST data of this form submitted to an external API, provide that custom URL here."
              name="extraPostUrl"
              value={extraPostUrl}
              onChangeHandler={this.update}
            />

            <TextProperty
              label="POST Forwarding Error Trigger"
              instructions="Provide a keyword or phrase Freeform should check for in the output of the external POST URL to know if and when there’s an error to log, e.g. ‘error’ or ‘an error occurred’."
              name="extraPostTriggerPhrase"
              value={extraPostTriggerPhrase}
              onChangeHandler={this.update}
            />
          </div>
        )}
      </div>
    );
  }

  handleTitleUpdate(event) {
    const { formId } = this.props;
    const { updateField } = this.context;
    const value = event.target.value;

    document.getElementById('header').querySelector('h1').innerHTML = value;

    const ul = document.getElementById('crumbs').getElementsByTagName('nav')[0].getElementsByTagName('ul')[0];

    ul.getElementsByTagName('li')[ul.getElementsByTagName('li').length - 1].innerHTML = '<a href>' + value + '</a>';

    document.title = value + ' - Craft';

    if (!formId) {
      updateField({ handle: getHandleValue(value, true) });
    }
    this.update(event);
  }

  getCheckboxFields() {
    const { composerProperties } = this.props;

    let checkboxFields = [];
    for (let key in composerProperties) {
      if (!composerProperties.hasOwnProperty(key)) {
        continue;
      }

      const prop = composerProperties[key];
      if (FieldTypes.CHECKBOX !== prop.type) {
        continue;
      }

      checkboxFields.push({
        key: key,
        value: prop.label,
      });
    }

    return checkboxFields;
  }
}
