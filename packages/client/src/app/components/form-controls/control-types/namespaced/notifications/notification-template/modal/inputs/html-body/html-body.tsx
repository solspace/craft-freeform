import { ControlBlock } from "@components/form-controls/control.block";
import config from "@config/freeform/freeform.config";
import { useAppStore } from "@editor/store";
import { useQueryClient } from "@tanstack/react-query";
import { Editor } from "@tinymce/tinymce-react";
import type { FC } from "react";
import tinymce from "tinymce/tinymce";

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

import type { InputControl } from "../../template.modal.types";

import { registerFormTokens } from "./tokens/tokens.plugin";

registerFormTokens(tinymce);

export const HtmlBodyInput: FC<InputControl> = (props) => {
  const { value, onChange } = props;
  const store = useAppStore();
  const queryClient = useQueryClient();

  const {
    templates: { toolbar },
    metadata: {
      tinymce: { stylesPath },
    },
  } = config;

  return (
    <ControlBlock {...props}>
      <Editor
        init={{
          branding: false,
          menubar: false,
          statusbar: true,
          promotion: false,
          content_css: stylesPath,
          store,
          queryClient,
        }}
        value={value}
        onEditorChange={onChange}
        plugins={plugins}
        toolbar={toolbar}
        licenseKey="gpl"
      />
    </ControlBlock>
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
  "freeform-tokens",
];
