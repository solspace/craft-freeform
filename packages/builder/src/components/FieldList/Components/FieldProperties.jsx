import fetch from 'isomorphic-fetch';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { fetchFieldsIfNeeded, invalidateFields } from '../../../actions/Fields';
import { translate } from '../../../app';
import * as FieldTypes from '../../../constants/FieldTypes';
import { getHandleValue } from '../../../helpers/Utilities';

@connect(
  (state) => ({
    fieldTypeList: state.fields.types,
  }),
  (dispatch) => ({
    fetchFields: () => {
      dispatch(invalidateFields());
      dispatch(fetchFieldsIfNeeded());
    },
  })
)
export default class FieldProperties extends Component {
  static initialState = {
    label: '',
    handle: '',
    type: FieldTypes.TEXT,
    errors: [],
  };

  static propTypes = {
    toggleFieldForm: PropTypes.func.isRequired,
    fetchFields: PropTypes.func.isRequired,
  };

  static contextTypes = {
    csrf: PropTypes.shape({
      name: PropTypes.string.isRequired,
      token: PropTypes.string.isRequired,
    }).isRequired,
    notificator: PropTypes.func.isRequired,
    createFieldUrl: PropTypes.string.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    this.state = FieldProperties.initialState;
    this.updateLabel = this.updateLabel.bind(this);
    this.updateHandle = this.updateHandle.bind(this);
    this.updateType = this.updateType.bind(this);
    this.updateState = this.updateState.bind(this);
    this.getHandle = this.getHandle.bind(this);
    this.addField = this.addField.bind(this);
    this.setErrors = this.setErrors.bind(this);
    this.cleanErrors = this.cleanErrors.bind(this);
  }

  componentDidMount() {
    ReactDOM.findDOMNode(this.refs.label).focus();
  }

  render() {
    const { label, handle, type, errors } = this.state;
    const { toggleFieldForm, fieldTypeList } = this.props;

    let options = [];
    for (let type in fieldTypeList) {
      if (!fieldTypeList.hasOwnProperty(type)) {
        continue;
      }

      options.push({ key: type, value: fieldTypeList[type] });
    }

    return (
      <div className="composer-new-field-form">
        <div className="field">
          <div className="heading">
            <label>{translate('Type')}</label>
          </div>
          <div className="select">
            <select name="type" value={type} ref="type" onChange={this.updateType} className="fullwidth">
              {options.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.value}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <div className="heading">
            <label>{translate('Label')}</label>
          </div>
          <div className="input">
            <input
              type="text"
              name="label"
              ref="label"
              className="text fullwidth"
              value={label}
              onChange={this.updateLabel}
              onKeyUp={this.updateState}
            />
          </div>
        </div>
        <div className="field">
          <div className="heading">
            <label>{translate('Handle')}</label>
          </div>
          <div className="input">
            <input
              type="text"
              name="handle"
              ref="handle"
              className="text fullwidth code"
              value={handle}
              onChange={this.updateHandle}
              onKeyUp={this.updateState}
            />
          </div>
        </div>

        {errors.length > 0 && (
          <div className="errors">
            {errors.map((message, index) => (
              <div key={index}>{message}</div>
            ))}
          </div>
        )}

        <button className="btn submit small" onClick={this.addField}>
          {translate('Save')}
        </button>
        <button className="btn cancel small" onClick={toggleFieldForm}>
          {translate('Cancel')}
        </button>
      </div>
    );
  }

  updateLabel(event) {
    const {
      target: { value },
    } = event;
    this.setState({
      label: value,
      handle: this.getHandle(value, true),
    });
  }

  updateHandle(event) {
    this.setState({ handle: this.getHandle(event.target.value, false) });
  }

  updateType(event) {
    this.setState({ type: event.target.value });

    ReactDOM.findDOMNode(this.refs.label).focus();
  }

  /**
   * Checks for ESC or ENTER keypress and cancels, or tries to submit the form
   *
   * @param event
   */
  updateState(event) {
    switch (event.which) {
      case 13: // ENTER
        this.addField();
        break;

      case 27: // ESC
        this.props.toggleFieldForm();
        break;
    }
  }

  /**
   * Gets the camelized version of LABEL and sets first char as lowercase
   *
   * @param {string}  value
   * @param {boolean} autoCamelize
   * @returns {string}
   */
  getHandle(value, autoCamelize = false) {
    return getHandleValue(value, autoCamelize);
  }

  /**
   * Adds the field via AJAX POST
   * Then triggers the fetching of fields
   *
   * @returns {boolean}
   */
  addField() {
    const { label, handle, type } = this.refs;
    const { toggleFieldForm, fetchFields } = this.props;
    const { csrf, notificator, createFieldUrl } = this.context;

    const labelValue = ReactDOM.findDOMNode(label).value;
    const handleValue = ReactDOM.findDOMNode(handle).value;
    const typeValue = ReactDOM.findDOMNode(type).value;

    const errors = [];

    if (!labelValue) {
      errors.push(translate('Label must not be empty'));
    }

    if (!handleValue) {
      errors.push(translate('Handle must not be empty'));
    }

    if (!typeValue) {
      errors.push(translate('Field type must not be empty'));
    }

    if (errors.length) {
      this.setErrors(errors);

      return false;
    }

    const formData = new FormData();
    formData.append(csrf.name, csrf.token);
    formData.append('label', labelValue);
    formData.append('handle', handleValue);
    formData.append('type', typeValue);

    fetch(createFieldUrl, {
      method: 'post',
      credentials: 'same-origin',
      body: formData,
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.success) {
          fetchFields();
          toggleFieldForm();

          notificator('notice', translate('Field added successfully'));
        } else {
          this.setErrors(json.errors);
        }
      })
      .catch((exception) => this.setErrors(exception));

    return true;
  }

  setErrors(errors) {
    this.setState({ errors: errors });
  }

  cleanErrors() {
    this.setState({ errors: [] });
  }
}
