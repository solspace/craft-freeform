import React, { Component } from 'react';
import { fetchFields } from '../../../actions/Actions';
import { translate } from '../../../app';
import FieldProperties from './FieldProperties';

export default class AddNewField extends Component {
  static EVENT_AFTER_UPDATE = 'freeform_add_new_field_after_render';

  static initialState = {
    showFieldForm: false,
  };

  constructor(props, context) {
    super(props, context);

    this.state = AddNewField.initialState;
    this.toggleFieldForm = this.toggleFieldForm.bind(this);
  }

  componentDidUpdate() {
    window.dispatchEvent(new Event(AddNewField.EVENT_AFTER_UPDATE));
  }

  render() {
    const { showFieldForm } = this.state;

    const className = 'composer-add-new-field-wrapper' + (showFieldForm ? ' active' : '');

    return (
      <div className={className}>
        {!showFieldForm && (
          <button className="btn add icon" onClick={this.toggleFieldForm}>
            {translate('Add New Field')}
          </button>
        )}

        {showFieldForm && <FieldProperties toggleFieldForm={this.toggleFieldForm} />}
      </div>
    );
  }

  toggleFieldForm() {
    this.setState({
      showFieldForm: !this.state.showFieldForm,
    });
  }
}
