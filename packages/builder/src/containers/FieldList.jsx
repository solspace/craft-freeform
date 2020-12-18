import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { addFieldToNewRow } from '../actions/Actions';
import FieldGroup from '../components/FieldList/FieldGroup';
import MailingListFieldGroup from '../components/FieldList/MailingListFieldGroup';
import SpecialFieldGroup from '../components/FieldList/SpecialFieldGroup';
import FieldHelper from '../helpers/FieldHelper';

@connect(
  (state) => ({
    fields: state.fields.fields,
    specialFields: state.specialFields,
    mailingListFields: state.mailingLists.list,
    layout: state.composer.layout,
  }),
  (dispatch) => ({
    onFieldClick: (hash, properties, pageIndex) => {
      dispatch(addFieldToNewRow(hash, properties, pageIndex));
    },
  })
)
export default class FieldList extends Component {
  static propTypes = {
    layout: PropTypes.array.isRequired,
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
    const { layout, fields } = this.props;
    const fieldIds = fields.map((field) => field.id);

    const usedFields = [];

    for (const rows of layout) {
      for (const row of rows) {
        for (const hash of row.columns) {
          const id = FieldHelper.deHashId(hash);

          if (fieldIds.indexOf(id) !== -1) {
            usedFields.push(id);
          }
        }
      }
    }

    return usedFields;
  }
}
