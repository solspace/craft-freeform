import { Breadcrumb } from "@components/breadcrumbs/breadcrumbs";
import { Sidebar } from "@components/layout/sidebar/sidebar";
import translate from "@ff-client/utils/translations";
import type React from "react";
import { useResolvedPath } from "react-router-dom";
import { DragContextProvider } from "./drag.context";
import { FieldLayout } from "./field-layout/field-layout";
import { FieldList } from "./field-list/field-list";
import { Grid } from "./layout.styles";
import { PropertyEditor } from "./property-editor/property-editor";

export const LayoutEditor: React.FC = () => {
  const currentPath = useResolvedPath("");

  return (
    <DragContextProvider>
      <Breadcrumb
        id="layout"
        label={translate("Layout")}
        url={currentPath.pathname}
      />
      <Grid>
        <Sidebar $noPadding>
          <PropertyEditor />
          <FieldList />
        </Sidebar>
        <FieldLayout />
      </Grid>
    </DragContextProvider>
  );
};
