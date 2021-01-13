import PropTypes from 'prop-types';
import React from 'react';
import AceEditor from 'react-ace';
import BasePropertyEditor from './BasePropertyEditor';
import { CheckboxProperty } from './PropertyItems';
import TextProperty from './PropertyItems/TextProperty';
import 'brace/theme/chrome';
import 'brace/mode/html';
import 'brace/ext/language_tools';

export default class Html extends BasePropertyEditor {
  static contextTypes = {
    ...BasePropertyEditor.contextTypes,
    hash: PropTypes.string.isRequired,
    properties: PropTypes.shape({
      type: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      twig: PropTypes.boolean,
    }).isRequired,
  };

  constructor(props, context) {
    super(props, context);

    this.updateHtmlValue = this.updateHtmlValue.bind(this);
  }

  render() {
    const {
      hash,
      properties: { value, twig },
    } = this.context;

    return (
      <div>
        <TextProperty
          label="Hash"
          instructions="Used to access this field on the frontend."
          name="handle"
          value={hash}
          className="code"
          readOnly={true}
        />

        <hr />

        <CheckboxProperty
          label="Allow Twig"
          instructions="Used to enable twig in HTML blocks"
          name="twig"
          checked={twig}
          onChangeHandler={this.update}
        />

        <AceEditor
          mode="html"
          theme="chrome"
          value={value}
          onChange={this.updateHtmlValue}
          enableLiveAutocompletion={true}
          enableBasicAutocompletion={true}
          highlightActiveLine={true}
          showGutter={false}
          fontSize={12}
          width="100%"
          editorProps={{ $blockScrolling: 'Infinity' }}
        />
      </div>
    );
  }

  /**
   * Custom value update handler for ACE editor
   *
   * @param value
   */
  updateHtmlValue(value) {
    const { updateField } = this.context;

    updateField({
      value: value,
    });
  }
}
