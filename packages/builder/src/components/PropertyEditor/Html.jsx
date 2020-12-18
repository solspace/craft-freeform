import PropTypes from 'prop-types';
import React from 'react';
import AceEditor from 'react-ace';
import BasePropertyEditor from './BasePropertyEditor';
import TextProperty from './PropertyItems/TextProperty';
import 'brace/ext/language_tools';
import 'brace/mode/html';
import 'brace/theme/chrome';

export default class Html extends BasePropertyEditor {
  static contextTypes = {
    ...BasePropertyEditor.contextTypes,
    hash: PropTypes.string.isRequired,
    properties: PropTypes.shape({
      type: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    }).isRequired,
  };

  constructor(props, context) {
    super(props, context);

    this.updateHtmlValue = this.updateHtmlValue.bind(this);
  }

  render() {
    const {
      hash,
      properties: { value },
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
          width="325px"
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
