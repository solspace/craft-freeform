import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { translate } from '../../app';
import FieldHelper from '../../helpers/FieldHelper';
import PropertyHelper from '../../helpers/PropertyHelper';
import Field from './Field';

@connect((state) => ({
  currentPage: state.context.page,
}))
export default class FieldGroup extends Component {
  static propTypes = {
    fields: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        handle: PropTypes.string.isRequired,
      }).isRequired
    ).isRequired,
    usedFields: PropTypes.array.isRequired,
    onFieldClick: PropTypes.func,
    currentPage: PropTypes.number,
  };

  static contextTypes = {
    canManageFields: PropTypes.bool.isRequired,
    canManageNotifications: PropTypes.bool.isRequired,
  };

  render() {
    const { fields, currentPage, usedFields, onFieldClick } = this.props;

    return (
      <div className="composer-fields">
        <h5 className="craft-header">{translate('Fields')}</h5>
        <ul>
          {fields.map(
            (field, index) =>
              field.label && (
                <Field
                  key={index}
                  hash={FieldHelper.hashField(field)}
                  {...field}
                  isUsed={usedFields.indexOf(field.id) !== -1}
                  onClick={() =>
                    onFieldClick(FieldHelper.hashField(field), PropertyHelper.getCleanProperties(field), currentPage)
                  }
                />
              )
          )}
        </ul>
      </div>
    );
  }
}
