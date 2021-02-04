import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import BasePropertyEditor from './BasePropertyEditor';
import { CheckboxProperty } from './PropertyItems';
import TextProperty from './PropertyItems/TextProperty';

import CompressIcon from '@ff/builder/assets/icons/compress-solid.svg';
import ExpandIcon from '@ff/builder/assets/icons/expand-solid.svg';

import 'ace-builds';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-twig';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/theme-chrome';
import 'ace-builds/src-noconflict/ext-language_tools';

export const Button = styled.div`
  margin-top: 10px;

  &.fullscreen {
    position: absolute;
    top: 5px;
    right: 5px;
    z-index: 2;

    margin-top: 0;
  }

  svg {
    width: 15px;
    height: 15px;
  }
`;

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

    this.state = { fullscreen: false };
    this.editor = React.createRef();
    this.updateHtmlValue = this.updateHtmlValue.bind(this);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.fullscreen !== this.state.fullscreen) {
      this.editor.current.editor.resize();
    }
  }

  render() {
    const { fullscreen } = this.state;

    const style = !fullscreen
      ? { height: 200 }
      : {
          width: 'auto',
          height: 'auto',
          position: 'absolute',
          zIndex: 1,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        };

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
          instructions="Used to enable Twig in HTML blocks"
          name="twig"
          checked={twig}
          onChangeHandler={this.update}
        />

        <AceEditor
          ref={this.editor}
          name="html-editor"
          mode={twig ? 'twig' : 'html'}
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
          style={style}
          setOptions={{ useWorker: false }}
        />

        <Button
          className={`btn ${fullscreen && 'fullscreen'}`}
          onClick={() => {
            this.setState({ fullscreen: !fullscreen });
          }}
        >
          {fullscreen ? <CompressIcon /> : <ExpandIcon />}
          <span style={{ paddingLeft: 5 }}>{fullscreen ? 'Exit Fullscreen mode' : 'Edit in Fullscreen mode'}</span>
        </Button>
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
