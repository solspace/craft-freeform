import PropTypes from 'prop-types';
import React from 'react';
import ReactQuill from 'react-quill';
import BasePropertyEditor from './BasePropertyEditor';
import TextProperty from './PropertyItems/TextProperty';

export default class RichText extends BasePropertyEditor {
  static contextTypes = {
    ...BasePropertyEditor.contextTypes,
    hash: PropTypes.string.isRequired,
    properties: PropTypes.shape({
      type: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    }).isRequired,
  };

  modules = {
    toolbar: [
      [
        { header: [1, 2, 3, false] },
        'bold',
        'italic',
        'underline',
        'link',
        { list: 'ordered' },
        { list: 'bullet' },
        'clean',
      ],
    ],
  };

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

        <ReactQuill
          style={{ marginTop: 20 }}
          value={value}
          onChange={this.updateValue}
          theme="snow"
          modules={this.modules}
        />
      </div>
    );
  }

  /**
   * Custom value update handler for ACE editor
   *
   * @param value
   */
  updateValue = (value) => {
    const { updateField } = this.context;

    updateField({
      value: value,
    });
  };
}
