import { Breadcrumb } from "@components/breadcrumbs/breadcrumbs";
import { ModalProvider } from "@components/modals/modal.context";
import type React from "react";

import { Edit } from "./edit";
import { EditorGlobalStyles } from "./edit.styles";

export const EditProvider: React.FC = () => {
  return (
    <>
      <Breadcrumb id="form-editor" label="Forms" url="/forms" />
      <EditorGlobalStyles />

      <ModalProvider>
        <Edit />
      </ModalProvider>
    </>
  );
};
