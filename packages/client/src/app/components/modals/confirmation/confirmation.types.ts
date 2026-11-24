import type { ReactNode } from "react";

export type ConfirmationOptions = {
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
};
