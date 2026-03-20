import classes from "@ff-client/utils/classes";
import type React from "react";
import type { PropsWithChildren } from "react";

import {
  EmptyBlockWrapper,
  Icon,
  LiteTitle,
  Subtitle,
  Title,
} from "./empty-block.styles";

type Props = {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconFade?: boolean;
  lite?: boolean;
};

export const EmptyBlock: React.FC<PropsWithChildren<Props>> = ({
  title,
  subtitle,
  icon,
  iconFade,
  lite,
  children,
}) => {
  if (lite) {
    return (
      <EmptyBlockWrapper className="padded">
        <LiteTitle>{title}</LiteTitle>
      </EmptyBlockWrapper>
    );
  }

  return (
    <EmptyBlockWrapper>
      {icon && <Icon className={classes(iconFade && "fade")}>{icon}</Icon>}

      {title && <Title>{title}</Title>}
      {subtitle && <Subtitle>{subtitle}</Subtitle>}

      {children}
    </EmptyBlockWrapper>
  );
};
