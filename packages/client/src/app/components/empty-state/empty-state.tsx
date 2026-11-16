import "@ff-empty-state-styles";

import classes from "@ff-client/utils/classes";
import type { FC, PropsWithChildren, ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  icon: ReactNode;
  framed?: boolean;
};

/** Shared empty-state reference; its stylesheet is also used by Twig settings pages. */
export const EmptyState: FC<PropsWithChildren<Props>> = ({
  title,
  description,
  icon,
  framed = true,
  children,
}) => (
  <div
    className={classes("ff-empty-state", framed && "ff-empty-state--framed")}
  >
    <div className="ff-empty-state-icon" aria-hidden="true">
      {icon}
    </div>
    <h2>{title}</h2>
    <p>{description}</p>
    {children && <div className="ff-empty-state-actions">{children}</div>}
  </div>
);
