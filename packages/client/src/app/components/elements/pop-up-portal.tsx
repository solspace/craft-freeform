import { usePortal } from "@editor/builder/contexts/portal.context";
import type React from "react";
import type { PropsWithChildren } from "react";
import { createPortal } from "react-dom";

export const PopUpPortal: React.FC<PropsWithChildren> = ({ children }) => {
  const { element } = usePortal();

  if (!element) {
    return null;
  }

  return createPortal(children, element);
};
