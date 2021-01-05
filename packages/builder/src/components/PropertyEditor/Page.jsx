import React from 'react';
import BasePropertyEditor from './BasePropertyEditor';
import TextProperty from './PropertyItems/TextProperty';

export default class Page extends BasePropertyEditor {
  static title = 'Page Property Editor';

  render() {
    const {
      properties: { label },
    } = this.context;

    return (
      <div>
        <TextProperty
          label="Label"
          instructions="Label for this page tab."
          name="label"
          value={label}
          onChangeHandler={this.update}
        />
      </div>
    );
  }
}
