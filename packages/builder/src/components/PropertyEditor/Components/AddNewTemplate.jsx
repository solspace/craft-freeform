import React, { Component } from 'react';
import { translate } from '../../../app';
import TemplateProperties from './TemplateProperties';

export default class AddNewTemplate extends Component {
  static initialState = {
    showForm: false,
  };

  constructor(props, context) {
    super(props, context);

    this.state = AddNewTemplate.initialState;
    this.toggleForm = this.toggleForm.bind(this);
  }

  render() {
    const { showForm } = this.state;

    const className = 'composer-add-new-template-wrapper' + (showForm ? ' active' : '');

    return (
      <div className={className}>
        {!showForm && (
          <button className="btn add icon" onClick={this.toggleForm}>
            {translate('Add new template')}
          </button>
        )}

        {showForm && <TemplateProperties toggleForm={this.toggleForm} />}
      </div>
    );
  }

  toggleForm() {
    this.setState({
      showForm: !this.state.showForm,
    });
  }
}
