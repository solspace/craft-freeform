import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { translate } from '../../app';
import FieldHelper from '../../helpers/FieldHelper';
import Field from './Field';

@connect((state) => ({
  currentPage: state.context.page,
}))
export default class MailingListFieldGroup extends Component {
  static propTypes = {
    fields: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        lists: PropTypes.array.isRequired,
      }).isRequired
    ).isRequired,
    usedFields: PropTypes.array.isRequired,
    onFieldClick: PropTypes.func,
    currentPage: PropTypes.number,
  };

  render() {
    const { fields, currentPage, usedFields, onFieldClick } = this.props;

    if (!fields.length) {
      return null;
    }

    return (
      <div className="composer-mailing-list-fields">
        <h5 className="craft-header">{translate('Mailing Lists')}</h5>
        <ul>
          {fields.map((field, index) => (
            <Field
              key={index}
              {...field}
              label={field.name}
              badge={field.source}
              type="mailing_list"
              isUsed={usedFields.indexOf(field.id) !== -1}
              onClick={() => onFieldClick(FieldHelper.hashField(field), field, currentPage)}
            />
          ))}
        </ul>
      </div>
    );
  }
}
