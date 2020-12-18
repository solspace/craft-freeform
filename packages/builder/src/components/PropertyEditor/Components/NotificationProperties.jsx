import fetch from 'isomorphic-fetch';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { fetchNotificationsIfNeeded, invalidateNotifications } from '../../../actions/Notifications';
import { translate } from '../../../app';
import { getHandleValue } from '../../../helpers/Utilities';

@connect(null, (dispatch) => ({
  fetchNotifications: (hash, id) => {
    dispatch(invalidateNotifications());
    dispatch(fetchNotificationsIfNeeded(hash, id));
  },
}))
export default class NotificationProperties extends Component {
  static initialState = {
    name: '',
    handle: '',
    errors: [],
  };

  static propTypes = {
    toggleForm: PropTypes.func.isRequired,
    fetchNotifications: PropTypes.func.isRequired,
  };

  static contextTypes = {
    csrf: PropTypes.shape({
      name: PropTypes.string.isRequired,
      token: PropTypes.string.isRequired,
    }).isRequired,
    notificator: PropTypes.func.isRequired,
    createNotificationUrl: PropTypes.string.isRequired,
    isDbEmailTemplateStorage: PropTypes.bool.isRequired,
    hash: PropTypes.string.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    this.state = NotificationProperties.initialState;
    this.updateName = this.updateName.bind(this);
    this.updateHandle = this.updateHandle.bind(this);
    this.updateState = this.updateState.bind(this);
    this.getHandle = this.getHandle.bind(this);
    this.addNotification = this.addNotification.bind(this);
    this.setErrors = this.setErrors.bind(this);
    this.cleanErrors = this.cleanErrors.bind(this);
  }

  componentDidMount() {
    ReactDOM.findDOMNode(this.refs.name).focus();
  }

  render() {
    const { name, handle, errors } = this.state;
    const { toggleForm } = this.props;
    const { isDbEmailTemplateStorage } = this.context;

    return (
      <div className="composer-new-field-form">
        <div className="field">
          <div className="heading">
            <label>{translate('Template Name')}</label>
          </div>
          <div className="input">
            <input
              type="text"
              name="name"
              ref="name"
              className="text fullwidth"
              value={name}
              onChange={this.updateName}
              onKeyUp={this.updateState}
            />
          </div>
        </div>
        {isDbEmailTemplateStorage && (
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
        )}

        {errors.length > 0 && (
          <div className="errors">
            {errors.map((message, index) => (
              <div key={index}>{message}</div>
            ))}
          </div>
        )}

        <button className="btn submit small" onClick={this.addNotification}>
          {translate('Save')}
        </button>
        <button className="btn cancel small" onClick={toggleForm}>
          {translate('Cancel')}
        </button>
      </div>
    );
  }

  updateName(event) {
    const {
      target: { value },
    } = event;
    this.setState({
      name: value,
      handle: this.getHandle(value),
    });
  }

  updateHandle(event) {
    this.setState({ handle: this.getHandle(event.target.value) });
  }

  /**
   * Checks for ESC or ENTER keypress and cancels, or tries to submit the form
   *
   * @param event
   */
  updateState(event) {
    switch (event.which) {
      case 13: // ENTER
        this.addNotification();
        break;

      case 27: // ESC
        this.props.toggleForm();
        break;
    }
  }

  /**
   * Gets the camelized version of LABEL and sets first char as lowercase
   *
   * @param {string} value
   * @returns {string}
   */
  getHandle(value) {
    return getHandleValue(value);
  }

  /**
   * Adds the field via AJAX POST
   * Then triggers the fetching of fields
   *
   * @returns {boolean}
   */
  addNotification() {
    const { name, handle } = this.refs;
    const { toggleForm, fetchNotifications } = this.props;
    const { csrf, notificator, createNotificationUrl, hash, isDbEmailTemplateStorage } = this.context;

    const nameValue = ReactDOM.findDOMNode(name).value;
    const handleValue = isDbEmailTemplateStorage ? ReactDOM.findDOMNode(handle).value : null;

    const errors = [];

    if (!nameValue) {
      errors.push(translate('Name must not be empty'));
    }

    if (!handleValue && isDbEmailTemplateStorage) {
      errors.push(translate('Handle must not be empty'));
    }

    if (errors.length) {
      this.setErrors(errors);

      return false;
    }

    const formData = new FormData();
    formData.append(csrf.name, csrf.token);
    formData.append('name', nameValue);
    formData.append('handle', handleValue);

    fetch(createNotificationUrl, {
      method: 'post',
      credentials: 'same-origin',
      body: formData,
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.success) {
          let id = json.id;
          if (/^[0-9]+$/.test(id)) {
            id = parseInt(id);
          }

          fetchNotifications(hash, id);
          toggleForm();

          notificator('notice', translate('Notification added successfully'));
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
