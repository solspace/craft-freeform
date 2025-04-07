import React from 'react';
import { useStore } from 'react-redux';
import { ControlBlock } from '@components/form-controls/control.block';
import config from '@config/freeform/freeform.config';
import { Editor } from '@tinymce/tinymce-react';
import tinymce from 'tinymce/tinymce';

import 'tinymce/tinymce';
import 'tinymce/models/dom/model';
import 'tinymce/themes/silver';
import 'tinymce/icons/default';
import 'tinymce/skins/ui/oxide/skin';
import 'tinymce/skins/ui/oxide/content';
// Plugins
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/code';
import 'tinymce/plugins/codesample';
import 'tinymce/plugins/image';
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/media';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/table';

import type { InputControl } from '../../template.modal.types';

import { registerFormTokens } from './html-body.plugin';

registerFormTokens(tinymce);

export const HtmlBodyInput: React.FC<InputControl> = (props) => {
  const store = useStore();

  const {
    metadata: {
      tinymce: { stylesPath },
    },
  } = config;

  return (
    <ControlBlock {...props}>
      <Editor
        init={{
          menubar: false,
          statusbar: true,
          promotion: false,
          content_css: stylesPath,
          store,
        }}
        initialValue={''}
        onEditorChange={console.log}
        plugins={plugins}
        toolbar={'undo redo | styleselect | bold italic | mergeTags'}
        licenseKey="gpl"
      />
    </ControlBlock>
  );
};

const plugins = [
  'autolink',
  'code',
  'codesample',
  'image',
  'link',
  'lists',
  'media',
  'searchreplace',
  'table',
  'mergeTags',
];
