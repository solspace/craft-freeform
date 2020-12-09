import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { CHECKBOX } from '../../../constants/FieldTypes';
import Badge from './Components/Badge';
import Checkbox from './Components/Checkbox';
import Instructions from './Components/Instructions';
import HtmlInput from './HtmlInput';

@connect((state) => ({
  hash: state.context.hash,
  composerProperties: state.composer.properties,
  mailingListIntegrations: state.mailingLists.list,
}))
export default class CheckboxField extends HtmlInput {
  static propTypes = {
    mailingListIntegrations: PropTypes.array.isRequired,
    hash: PropTypes.string,
    properties: PropTypes.shape({
      label: PropTypes.string.isRequired,
      required: PropTypes.bool.isRequired,
      checked: PropTypes.bool,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
    }).isRequired,
  };

  getClassName() {
    return 'CheckboxField';
  }

  getType() {
    return CHECKBOX;
  }

  getBadges() {
    const badges = super.getBadges();
    const { value } = this.props.properties;

    if (!value) {
      badges.push(<Badge key={'value'} label="No Value set" type={Badge.WARNING} />);
    }

    return badges;
  }

  render() {
    const { properties } = this.props;

    const { label, required, checked, instructions } = properties;

    return (
      <div className={this.prepareWrapperClass()}>
        <Instructions instructions={instructions} />
        <Checkbox label={label} isChecked={!!checked} properties={properties} isRequired={required}>
          {this.getBadges()}
        </Checkbox>
      </div>
    );
  }
}
