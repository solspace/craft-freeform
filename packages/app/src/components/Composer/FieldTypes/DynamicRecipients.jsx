import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import * as ExternalOptions from '../../../constants/ExternalOptions';
import * as FieldTypes from '../../../constants/FieldTypes';
import Badge from './Components/Badge';
import Checkbox from './Components/Checkbox';
import Option from './Components/Option';
import Radio from './Components/Radio';
import HtmlInput from './HtmlInput';

@connect((state) => ({
  hash: state.context.hash,
  composerProperties: state.composer.properties,
  isFetchingOptions: state.generatedOptionLists.isFetching,
  generatedOptions: state.generatedOptionLists.cache,
}))
export default class DynamicRecipients extends HtmlInput {
  static propTypes = {
    ...HtmlInput.propTypes,
    notificationId: PropTypes.number,
    showAsRadio: PropTypes.bool,
    showAsCheckboxes: PropTypes.bool,
    isFetchingOptions: PropTypes.bool.isRequired,
  };

  cachedOptions = null;

  getClassName() {
    return 'DynamicRecipients';
  }

  constructor(props, context) {
    super(props, context);

    this.renderAsSelect = this.renderAsSelect.bind(this);
    this.renderAsRadios = this.renderAsRadios.bind(this);
    this.renderAsCheckboxes = this.renderAsCheckboxes.bind(this);
  }

  getType() {
    return FieldTypes.DYNAMIC_RECIPIENTS;
  }

  getBadges() {
    const badges = super.getBadges();
    const { notificationId } = this.props.properties;

    if (!notificationId) {
      badges.push(<Badge key={'template'} label="No Template" type={Badge.WARNING} />);
    }

    return badges;
  }

  getWrapperClassNames() {
    const classNames = super.getWrapperClassNames();

    if (this.props.properties.oneLine) {
      classNames.push('composer-one-line-items');
    }

    return classNames;
  }

  renderInput() {
    const { showAsRadio, showAsCheckboxes } = this.props.properties;

    if (showAsRadio) {
      return this.renderAsRadios();
    } else if (showAsCheckboxes) {
      return this.renderAsCheckboxes();
    }

    return this.renderAsSelect();
  }

  renderAsSelect() {
    const { properties, generatedOptions, isFetchingOptions } = this.props;
    const { options, source, hash, values = [] } = properties;
    const firstValue = values && values.length > 0 ? values[0] : '';

    if (isFetchingOptions && this.cachedOptions) {
      return this.cachedOptions;
    }

    let listOptions = [];
    if (!source || source === ExternalOptions.SOURCE_CUSTOM) {
      listOptions = options;
    } else if (generatedOptions && generatedOptions[hash]) {
      listOptions = generatedOptions[hash];
    }

    let selectOptions = [];
    if (listOptions) {
      for (let i = 0; i < listOptions.length; i++) {
        const { label, value } = listOptions[i];

        selectOptions.push(<Option key={i} label={label} value={value} properties={properties} />);
      }
    }

    const field = (
      <div className="select">
        <select className={this.prepareInputClass()} readOnly={true} disabled={true} value={firstValue}>
          {selectOptions}
        </select>
      </div>
    );

    this.cachedOptions = field;

    return field;
  }

  renderAsRadios() {
    const { properties, generatedOptions, isFetchingOptions } = this.props;
    const { options, source, hash, values = [] } = properties;
    const firstValue = values && values.length > 0 ? values[0] : '';

    if (isFetchingOptions && this.cachedOptions) {
      return this.cachedOptions;
    }

    let listOptions = [];
    if (!source || source === ExternalOptions.SOURCE_CUSTOM) {
      listOptions = options;
    } else if (generatedOptions && generatedOptions[hash]) {
      listOptions = generatedOptions[hash];
    }

    let radioOptions = [];
    if (listOptions) {
      for (let i = 0; i < listOptions.length; i++) {
        const { label, value } = listOptions[i];

        radioOptions.push(
          <Radio key={i} label={label} value={value} properties={properties} isChecked={firstValue === value} />
        );
      }
    }

    const field = <div>{radioOptions}</div>;

    this.cachedOptions = field;

    return field;
  }

  renderAsCheckboxes() {
    const { properties, generatedOptions, isFetchingOptions } = this.props;
    const { options, source, hash, values = [] } = properties;

    if (isFetchingOptions && this.cachedOptions) {
      return this.cachedOptions;
    }

    let listOptions = [];
    if (!source || source === ExternalOptions.SOURCE_CUSTOM) {
      listOptions = options;
    } else if (generatedOptions && generatedOptions[hash]) {
      listOptions = generatedOptions[hash];
    }

    let checkboxOptions = [];
    if (listOptions) {
      for (let i = 0; i < listOptions.length; i++) {
        const { label, value } = listOptions[i];

        checkboxOptions.push(
          <Checkbox
            key={i}
            label={label}
            value={value}
            properties={properties}
            isChecked={value ? values && values.indexOf(value) !== -1 : false}
          />
        );
      }
    }

    const field = <div>{checkboxOptions}</div>;

    this.cachedOptions = field;

    return field;
  }
}
