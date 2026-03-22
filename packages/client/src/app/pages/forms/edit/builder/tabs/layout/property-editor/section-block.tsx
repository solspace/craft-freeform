import DOMPurify from "dompurify";
import type React from "react";
import type { PropsWithChildren, ReactNode } from "react";

import {
  SectionBlockContainer,
  SectionBlockIcon,
  SectionBlockWrapper,
} from "./section-block.styles";

type Props = {
  label?: string;
  icon?: string | ReactNode;
};

const renderIcon = (icon?: string | ReactNode): ReactNode => {
  if (!icon) {
    return null;
  }

  if (typeof icon === "string") {
    return (
      <SectionBlockIcon
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(icon) }}
      />
    );
  }

  return <SectionBlockIcon>{icon}</SectionBlockIcon>;
};

export const SectionBlock: React.FC<PropsWithChildren<Props>> = ({
  label,
  icon,
  children,
}) => {
  return (
    <SectionBlockWrapper>
      <SectionBlockContainer data-label={label}>
        {children}
      </SectionBlockContainer>
      {renderIcon(icon)}
    </SectionBlockWrapper>
  );
};
