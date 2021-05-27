import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { addFieldToNewRow } from '../actions/Actions';
import FieldGroup from '../components/FieldList/FieldGroup';
import MailingListFieldGroup from '../components/FieldList/MailingListFieldGroup';
import SpecialFieldGroup from '../components/FieldList/SpecialFieldGroup';

@connect(
  (state) => ({
    fields: state.fields.fields,
    specialFields: state.specialFields,
    mailingListFields: state.mailingLists.list,
    properties: state.composer.properties,
  }),
  (dispatch) => ({
    onFieldClick: (hash, properties, pageIndex) => {
      dispatch(addFieldToNewRow(hash, properties, pageIndex));
    },
  })
)
export default class FieldList extends Component {
  static propTypes = {
    properties: PropTypes.object.isRequired,
    fields: PropTypes.array.isRequired,
    specialFields: PropTypes.array.isRequired,
    mailingListFields: PropTypes.array.isRequired,
    onFieldClick: PropTypes.func.isRequired,
  };

  render() {
    const { fields, specialFields, mailingListFields, onFieldClick } = this.props;

    const usedFields = this.getUsedFields();

    return (
      <div className="field-list">
        <SpecialFieldGroup fields={specialFields} onFieldClick={onFieldClick} />

        <hr />

        <FieldGroup fields={fields} usedFields={usedFields} onFieldClick={onFieldClick} />

        {!!mailingListFields.length && <hr />}

        <MailingListFieldGroup fields={mailingListFields} usedFields={usedFields} onFieldClick={onFieldClick} />
      </div>
    );
  }

  getUsedFields() {
    const { properties } = this.props;

    const usedFields = [];

    // eslint-disable-next-line no-unused-vars
    for (const [key, value] of Object.entries(properties)) {
      if (value.id !== undefined) {
        usedFields.push(value.id);
      }
    }

    return usedFields;
  }
}
