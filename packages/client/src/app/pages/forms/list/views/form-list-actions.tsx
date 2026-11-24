import type { ComponentPropsWithoutRef, ReactNode } from "react";

export const FormRestoreButton = ({
  children,
  ...props
}: ComponentPropsWithoutRef<"button">) => (
  <button type="button" className="btn small ff-merge-trash-restore" {...props}>
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5.5 2.5 2 6l3.5 3.5M2 6h7.75a3.25 3.25 0 0 1 0 6.5H7.5" />
    </svg>
    <span>{children}</span>
  </button>
);

export const FormDeleteButton = ({
  children,
  icon,
  ...props
}: ComponentPropsWithoutRef<"button"> & { icon: ReactNode }) => (
  <button type="button" className="btn small ff-merge-trash-delete" {...props}>
    {icon}
    <span>{children}</span>
  </button>
);
