import translate from "@ff-client/utils/translations";
import type { PropsWithChildren } from "react";
import { PreviewContent, PreviewCue } from "./property-preview.styles";

export const PropertyPreview: React.FC<PropsWithChildren> = ({ children }) => (
  <>
    <PreviewContent>{children}</PreviewContent>
    <PreviewCue>{translate("Click to edit data")}</PreviewCue>
  </>
);
