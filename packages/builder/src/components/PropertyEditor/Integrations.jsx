import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { fetchCrmIntegrationsIfNeeded, invalidateCrmIntegrations } from '../../actions/Integrations';
import { translate } from '../../app';
import * as FieldTypes from '../../constants/FieldTypes';
import BasePropertyEditor from './BasePropertyEditor';
import IntegrationMappingTable from './Components/IntegrationMappingTable/IntegrationMappingTable';
import CustomProperty from './PropertyItems/CustomProperty';
import SelectProperty from './PropertyItems/SelectProperty';
import RequirePro from './Components/RequirePro';

@connect(
  (state) => ({
    properties: state.composer.properties,
    integrationProperties: state.composer.properties.integration,
    integrationList: state.integrations.list,
    isFetching: state.integrations.isFetching,
  }),
  (dispatch) => ({
    fetchCrmIntegrations: () => {
      dispatch(invalidateCrmIntegrations());
      dispatch(fetchCrmIntegrationsIfNeeded());
    },
  })
)
export default class Integrations extends BasePropertyEditor {
  static title = 'CRM Integration';

  static propTypes = {
    integrationList: PropTypes.array.isRequired,
    integrationProperties: PropTypes.object.isRequired,
    properties: PropTypes.object.isRequired,
    isFetching: PropTypes.bool.isRequired,
    fetchCrmIntegrations: PropTypes.func.isRequired,
  };

  static contextTypes = {
    ...BasePropertyEditor.contextTypes,
    isPro: PropTypes.bool,
    hash: PropTypes.string.isRequired,
    properties: PropTypes.shape({
      type: PropTypes.string.isRequired,
      integrationId: PropTypes.node,
      mapping: PropTypes.any,
    }),
  };

  constructor(props, context) {
    super(props, context);

    this.updateIntegration = this.updateIntegration.bind(this);
  }

  render() {
    const { isPro } = this.context;
    if (!isPro) {
      return <RequirePro />;
    }

    const {
      integrationList,
      properties,
      integrationProperties: { integrationId, mapping },
    } = this.props;

    const { isFetching, fetchCrmIntegrations } = this.props;

    let fieldList = [];
    const integrationOptions = [];
    integrationList.map((item) => {
      integrationOptions.push({
        key: item.id,
        value: item.name,
      });

      if (item.id == integrationId) {
        fieldList = item.fields;
      }
    });

    const formFields = [];
    for (let key in properties) {
      if (!properties.hasOwnProperty(key)) {
        continue;
      }

      const prop = properties[key];
      if (FieldTypes.INTEGRATION_SUPPORTED_TYPES.indexOf(prop.type) === -1) {
        continue;
      }

      formFields.push({
        handle: prop.handle,
        label: prop.label,
      });
    }

    let extraFields = null;
    if (properties.payment && properties.payment.integrationId) {
      extraFields = [
        {
          handle: 'payments',
          label: 'Payments',
          fields: [
            { key: 'amount', value: 'Amount' },
            { key: 'interval', value: 'Interval' },
            { key: 'intervalCount', value: 'Interval Count' },
            { key: 'metadata[card][fingerprint]', value: 'Card Token' },
            { key: 'last4', value: 'Card Last 4' },
            { key: 'metadata[card][brand]', value: 'Card Type' },
            { key: 'metadata[chargeId]', value: 'Stripe Charge ID' },
            { key: 'metadata[customerId]', value: 'Stripe Customer ID' },
            { key: 'metadata[hash]', value: 'Stripe Transaction Hash' },
          ],
        },
      ];
    }

    let mappingField = '';
    if (integrationId) {
      mappingField = (
        <CustomProperty
          label="Field Mapping"
          instructions="Map CRM fields to your Freeform fields."
          content={
            <IntegrationMappingTable
              formFields={formFields}
              extraFields={extraFields}
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
        <SelectProperty
          label="Integration"
          instructions="Choose an integration type"
          name="integrationId"
          ref="integration"
          value={integrationId ? integrationId : 0}
          isNumeric={true}
          emptyOption="Choose an integration..."
          options={integrationOptions}
          onChangeHandler={this.updateIntegration}
        />

        <button className="btn refresh icon" onClick={fetchCrmIntegrations} disabled={isFetching}>
          {translate(isFetching ? 'Refreshing...' : 'Refresh Integration')}
        </button>

        {mappingField}
      </div>
    );
  }

  updateIntegration(event) {
    const { updateField } = this.context;
    const integration = event.target;

    const integrationId = parseInt(integration.value);

    updateField({
      integrationId: integrationId ? integrationId : 0,
      mapping: {},
    });
  }
}
