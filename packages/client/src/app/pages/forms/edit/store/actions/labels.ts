import { createAction } from "@reduxjs/toolkit";

export const applyLabels = createAction<{
  labels: { uid: string; label: string }[];
  siteId?: number;
}>("layout/labels/apply");
