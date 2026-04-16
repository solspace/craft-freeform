import {
  PreviewContainer,
  PreviewEditor,
} from "@components/form-controls/preview/previewable-component.styles";
import config from "@config/freeform/freeform.config";
import { Editor } from "@tinymce/tinymce-react";
import type { FC } from "react";

import "tinymce/tinymce";
import "tinymce/models/dom/model";
import "tinymce/themes/silver";
import "tinymce/icons/default";
import "tinymce/skins/ui/oxide/skin";
import "tinymce/skins/ui/oxide/content";
import "tinymce/plugins/advlist";
import "tinymce/plugins/autolink";
import "tinymce/plugins/code";
import "tinymce/plugins/codesample";
import "tinymce/plugins/image";
import "tinymce/plugins/link";
import "tinymce/plugins/lists";
import "tinymce/plugins/media";
import "tinymce/plugins/searchreplace";
import "tinymce/plugins/table";

import { WysiwygEditorWrapper } from "./wysiwyg.editor.styles";

type Props = {
  value: string;
  updateValue: (value: string) => void;
  menu: boolean;
  statusbar: boolean;
  toolbar: string[] | boolean;
};

export const WysiwygEditor: FC<Props> = ({
  value,
  menu,
  statusbar,
  toolbar,
  updateValue,
}) => {
  const {
    metadata: {
      tinymce: { stylesPath },
    },
  } = config;

  return (
    <PreviewEditor>
      <PreviewContainer>
        <WysiwygEditorWrapper>
          <Editor
            init={{
              menubar: menu,
              statusbar: statusbar,
              promotion: false,
              content_css: stylesPath,
              relative_urls: false,
              remove_script_host: false,
            }}
            value={value}
            onEditorChange={updateValue}
            plugins={plugins}
            toolbar={toolbar}
            licenseKey="gpl"
          />
        </WysiwygEditorWrapper>
      </PreviewContainer>
    </PreviewEditor>
  );
};

const plugins = [
  "autolink",
  "code",
  "codesample",
  "image",
  "link",
  "lists",
  "media",
  "searchreplace",
  "table",
];
