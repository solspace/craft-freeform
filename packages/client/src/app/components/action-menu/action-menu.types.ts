import type { ReactNode } from "react";

export type ActionMenuChoice = {
  destructive?: boolean;
  icon?: ReactNode;
  label: string;
  className?: string;
  onClick: () => void;
};
