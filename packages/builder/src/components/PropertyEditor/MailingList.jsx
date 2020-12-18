import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { fetchMailingListsIfNeeded, invalidateMailingLists } from '../../actions/MailingLists';
import { translate } from '../../app';
import * as FieldTypes from '../../constants/FieldTypes';
import BasePropertyEditor from './BasePropertyEditor';
import IntegrationMappingTable from './Components/IntegrationMappingTable/IntegrationMappingTable';
import { AttributeEditorProperty } from './PropertyItems';
import CheckboxProperty from './PropertyItems/CheckboxProperty';
import CustomProperty from './PropertyItems/CustomProperty';
import ExternalOptionsProperty from './PropertyItems/ExternalOptionsProperty';
import SelectProperty from './PropertyItems/SelectProperty';
import TextareaProperty from './PropertyItems/TextareaProperty';
import TextProperty from './PropertyItems/TextProperty';

@connect(
  (state) => ({
    composerProperties: state.composer.properties,
    hash: state.context.hash,
    mailingLists: state.mailingLists.list,
    isFetching: state.mailingLists.isFetching,
  }),
  (dispatch) => ({
    fetchMailingLists: () => {
      dispatch(invalidateMailingLists());
      dispatch(fetchMailingListsIfNeeded());
    },
  })
)
export default class MailingList extends BasePropertyEditor {
  static propTypes = {
    fetchMailingLists: PropTypes.func.isRequired,
    isFetching: PropTypes.bool.isRequired,
    composerProperties: PropTypes.object.isRequired,
    mailingLists: PropTypes.arrayOf(
      PropTypes.shape({
        integrationId: PropTypes.number.isRequired,
        resourceId: PropTypes.node,
        emailFieldHash: PropTypes.string,
        type: PropTypes.string.isRequired,
        source: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        label: PropTypes.string,
      })
    ).isRequired,
  };

  static contextTypes = {
    ...BasePropertyEditor.contextTypes,
    hash: PropTypes.string.isRequired,
    properties: PropTypes.shape({
      type: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      integrationId: PropTypes.number.isRequired,
      resourceId: PropTypes.node,
      emailFieldHash: PropTypes.string,
      hidden: PropTypes.bool,
    }).isRequired,
  };

  constructor(props, context) {
    super(props, context);

    this.updateIntegration = this.updateIntegration.bind(this);
  }

  render() {
    const {
      hash,
      properties: { value, label, integrationId, resourceId, emailFieldHash, mapping = {}, instructions, hidden },
    } = this.context;

    const { composerProperties, mailingLists, fetchMailingLists, isFetching } = this.props;

    let selectedIntegration = null;
    let lists = [];

    for (const integration of mailingLists) {
      if (integration.integrationId === integrationId) {
        selectedIntegration = integration;
        integration.lists.map((item) => {
          lists.push({
            key: item.id,
            value: item.name,
          });
        });

        break;
      }
    }

    let emailFields = [];
    for (let key in composerProperties) {
      if (!composerProperties.hasOwnProperty(key)) {
        continue;
      }

      const prop = composerProperties[key];

      if (prop.type !== FieldTypes.EMAIL) {
        continue;
      }

      emailFields.push({
        key: key,
        value: prop.label,
      });
    }

    let mappingField = '';
    if (resourceId && selectedIntegration) {
      const selectedMailingList = selectedIntegration.lists.find((item) => {
        return item.id == resourceId;
      });

      const formFields = [];
      for (let key in composerProperties) {
        if (!composerProperties.hasOwnProperty(key)) {
          continue;
        }

        const prop = composerProperties[key];
        if (FieldTypes.INTEGRATION_SUPPORTED_TYPES.indexOf(prop.type) === -1) {
          continue;
        }

        formFields.push({
          handle: prop.handle,
          label: prop.label,
        });
      }

      let fieldList = [];
      if (selectedMailingList) {
        fieldList = selectedMailingList.fields;
      }

      mappingField = (
        <CustomProperty
          label="Field Mapping"
          instructions="Map Mailing List fields to your Freeform fields."
          content={
            <IntegrationMappingTable
              formFields={formFields}
              fields={fieldList}
              mapping={mapping}
              mappedAttributeLabel="CRM Field"
            />
          }
        />
      );
    }

    return (
      <div>
        <TextProperty
          label="Handle"
          instructions="How you’ll refer to this field in the templates."
          name="handle"
          value={hash}
          onChangeHandler={this.updateHandle}
          className="code"
        />

        <TextProperty
          label="Label"
          instructions="Field label used to describe the field."
          name="label"
          value={label}
          onChangeHandler={this.update}
        />

        <hr />

        <TextareaProperty
          label="Instructions"
          instructions="Field specific user instructions."
          name="instructions"
          value={instructions}
          onChangeHandler={this.update}
        />

        <hr />

        <h4>{translate('Configuration')}</h4>

        <CheckboxProperty
          label="Hide field"
          instructions="Hide the mailing list checkbox from the form and make it always trigger a subscription"
          name="hidden"
          checked={hidden}
          onChangeHandler={this.update}
        />

        {!hidden && (
          <CheckboxProperty label="Checked by default" name="value" checked={value} onChangeHandler={this.update} />
        )}

        <SelectProperty
          label="Mailing Lists"
          instructions="Choose the opt-in mailing list that users will be added to."
          name="resourceId"
          onChangeHandler={this.updateIntegration}
          value={resourceId}
          emptyOption="Select a list..."
          options={lists}
        />

        <button className="btn download icon" onClick={fetchMailingLists} disabled={isFetching}>
          {translate(isFetching ? 'Refreshing...' : 'Refresh lists')}
        </button>

        <SelectProperty
          label="Target Email Field"
          instructions="The email field used to push to the mailing list."
          name="emailFieldHash"
          onChangeHandler={this.update}
          value={emailFieldHash}
          emptyOption="Select a field..."
          options={emailFields}
        />

        {mappingField}

        <AttributeEditorProperty />
      </div>
    );
  }

  updateIntegration(event) {
    const { updateField } = this.context;
    const resource = event.target;

    const resourceId = resource.value;

    updateField({
      resourceId: resourceId ? resourceId : '',
      mapping: {},
    });

    this.update(event);
  }
}
