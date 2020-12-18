import PropTypes from 'prop-types';
import qwest from 'qwest';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { updateFormId, updateProperty } from '../actions/Actions';
import { translate } from '../app';
import { FORM } from '../constants/FieldTypes';

const originalTitle = 'Quick save';
const progressTitle = 'Saving...';

@connect(
  (state) => ({
    formId: state.formId,
    composer: state.composer,
    context: state.context,
    currentFormHandle: state.composer.properties.form.handle,
  }),
  (dispatch) => ({
    updateFormId: (formId) => dispatch(updateFormId(formId)),
    updateFormHandle: (newHandle) => dispatch(updateProperty(FORM, { handle: newHandle })),
  })
)
export default class SaveButton extends Component {
  static propTypes = {
    saveUrl: PropTypes.string.isRequired,
    formUrl: PropTypes.string.isRequired,
    updateFormId: PropTypes.func.isRequired,
    updateFormHandle: PropTypes.func.isRequired,
    formId: PropTypes.number,
    currentFormHandle: PropTypes.string,
  };

  static contextTypes = {
    store: PropTypes.object,
    csrf: PropTypes.shape({
      name: PropTypes.string.isRequired,
      token: PropTypes.string.isRequired,
    }).isRequired,
    notificator: PropTypes.func.isRequired,
  };

  saveButtonElement;

  constructor(props, context) {
    super(props, context);

    this.save = this.save.bind(this);
    this.checkForSaveShortcut = this.checkForSaveShortcut.bind(this);

    document.addEventListener('keydown', this.checkForSaveShortcut, false);
  }

  componentDidMount() {
    this.saveButtonElement = document.getElementById('freeform-save-commands');
    const items = this.saveButtonElement.querySelectorAll('input, a');
    for (let i = 0; i < items.length; i++) {
      items[i].addEventListener('click', this.save);
    }
  }

  componentWillUnmount() {
    const items = this.saveButtonElement.querySelectorAll('input, a');
    for (let i = 0; i < items.length; i++) {
      items[i].removeEventListener('click', this.save);
    }
  }

  render() {
    return <span />;
  }

  save(event) {
    const { saveUrl, formUrl, formId, composer, context } = this.props;
    const { currentFormHandle, updateFormId, updateFormHandle } = this.props;
    const { csrf, notificator } = this.context;

    let savableState = {
      [csrf.name]: csrf.token,
      formId,
      composerState: JSON.stringify({
        composer,
        context,
      }),
    };

    const shouldGotoFormList = event.target.className.match(/gotoFormList/);
    const shouldGotoNewForm = event.target.className.match(/gotoNewForm/);
    const duplicateForm = event.target.className.match(/duplicateForm/);

    if (duplicateForm) {
      savableState.formId = '';
      savableState.duplicate = true;
    }

    this.saveButtonElement.querySelector('input').value = translate(progressTitle);

    return qwest
      .post(saveUrl, savableState, { responseType: 'json' })
      .then((xhr, response) => {
        this.saveButtonElement.querySelector('input').value = translate(originalTitle);

        if (response.success) {
          const url = formUrl.replace('{id}', response.id);
          history.pushState(response.id, '', url);

          updateFormId(response.id);
          if (currentFormHandle !== response.handle) {
            updateFormHandle(response.handle);
          }

          notificator('notice', translate('Saved successfully'));
          if (shouldGotoFormList) {
            window.location.href = formUrl.replace('{id}', '');
          } else if (shouldGotoNewForm) {
            window.location.href = formUrl.replace('{id}', 'new');
          }

          return true;
        }

        response.errors.map((message) => notificator('error', message));
      })
      .catch((exception) => {
        notificator('error', exception);
        this.saveButtonElement.querySelector('input').value = translate(originalTitle);
      });
  }

  checkForSaveShortcut(event) {
    const sKey = 83;
    const keyCode = event.which;

    if (keyCode == sKey && this.isModifierKeyPressed(event)) {
      event.preventDefault();

      this.save(event);

      return false;
    }
  }

  isModifierKeyPressed(event) {
    // metaKey maps to ⌘ on Macs
    if (window.navigator.platform.match(/Mac/)) {
      return event.metaKey;
    }

    // Both altKey and ctrlKey == true on some Windows keyboards when the right-hand ALT key is pressed
    // so just be safe and make sure altKey == false
    return event.ctrlKey && !event.altKey;
  }
}
