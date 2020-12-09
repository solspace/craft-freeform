import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { MappingTable } from '../../Components/Connections/MappingTable';
import { CustomProperty } from '../../PropertyItems';

export default class ConnectionBase extends Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    connection: PropTypes.object.isRequired,
    updateConnection: PropTypes.func.isRequired,
  };

  updateSelection = (event) => {
    const { name, type } = event.target;
    let { value } = event.target;

    if (type === 'checkbox') {
      value = event.target.checked;
    }

    this.persistValues(name, value);
  };

  persistValues = (name, value) => {
    const { updateConnection, index, connection } = this.props;
    const waterfall = this.getResetWaterfall();
    waterfall.push('mapping');

    const updatedProperties = {
      ...connection,
      [name]: value,
    };

    let hasHitReset = false;
    for (const propName of waterfall) {
      if (hasHitReset) {
        updatedProperties[propName] = null;
      }

      if (name === propName) {
        hasHitReset = true;
      }
    }

    updateConnection(index, updatedProperties);
  };

  getResetWaterfall = () => [];
  getSpecificCraftFields = () => [];
  getCraftFieldLayoutFieldIds = () => [];

  getFieldMapping = () => {
    const { connection } = this.props;
    const { mapping = {} } = connection;

    return (
      <CustomProperty label="Field mapping" name="mapping">
        <MappingTable
          specificFields={this.getSpecificCraftFields()}
          fieldLayoutFieldIds={this.getCraftFieldLayoutFieldIds()}
          mapping={mapping}
          onChangeHandler={this.persistValues}
        />
      </CustomProperty>
    );
  };
}
