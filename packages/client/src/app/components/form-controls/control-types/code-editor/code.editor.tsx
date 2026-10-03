import {
  PreviewContainer,
  PreviewEditor,
} from "@components/form-controls/preview/previewable-component.styles";
import { Editor } from "@monaco-editor/react";
import type React from "react";

type Props = {
  value: string;
  language: string;
  updateValue: (value: string) => void;
  fullHeight?: boolean;
};

export const CodeEditor: React.FC<Props> = ({
  value,
  language,
  updateValue,
  fullHeight = false,
}) => {
  return (
    <PreviewEditor>
      <PreviewContainer>
        <Editor
          height={fullHeight ? "100%" : 500}
          value={value}
          defaultLanguage={language}
          onChange={updateValue}
          onMount={() => {
            document.body.classList.remove("underline-links");
          }}
          options={{
            scrollbar: {
              verticalScrollbarSize: 5,
              horizontalScrollbarSize: 5,
            },
          }}
        />
      </PreviewContainer>
    </PreviewEditor>
  );
};
