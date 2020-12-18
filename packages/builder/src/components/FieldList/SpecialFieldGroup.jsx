import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { connect } from 'react-redux';
import { translate } from '../../app';
import FieldHelper from '../../helpers/FieldHelper';
import AddNewField from './Components/AddNewField';
import Field from './Field';
import PropertyHelper from '../../helpers/PropertyHelper';

@connect((state) => ({
  globalProps: state.composer.properties,
  currentPage: state.context.page,
}))
export default class SpecialFieldGroup extends Component {
  static propTypes = {
    globalProps: PropTypes.object,
    fields: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
      }).isRequired
    ).isRequired,
    onFieldClick: PropTypes.func,
    currentPage: PropTypes.number,
  };

  static contextTypes = {
    canManageFields: PropTypes.bool.isRequired,
    canManageNotifications: PropTypes.bool.isRequired,
  };

  filterSingletons = (fields) => {
    const { globalProps } = this.props;

    return fields.filter((field) => {
      const props = Object.keys(globalProps).find((key) => globalProps[key].type == field.type);

      return !(field.singleton === true && props);
    });
  };

  render() {
    const { fields, currentPage, onFieldClick } = this.props;
    const { canManageFields } = this.context;
    const visibleFields = this.filterSingletons(fields);

    return (
      <div className="composer-special-fields">
        <h5 className="craft-header">{translate('Special Fields')}</h5>
        <ul>
          {visibleFields.map((field, index) => (
            <Field
              key={index}
              {...field}
              isUsed={false}
              onClick={() =>
                onFieldClick(FieldHelper.hashField(field), PropertyHelper.getCleanProperties(field), currentPage)
              }
            />
          ))}
        </ul>

        {canManageFields && <AddNewField />}
      </div>
    );
  }
}
