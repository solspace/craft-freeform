import type { PropsWithChildren, ReactNode } from 'react';
import React from 'react';

import { Icon } from './property-editor.styles';
import { SectionBlockContainer } from './section-block.styles';

type Props = {
  label?: string;
  icon?: string | ReactNode;
};

export const SectionBlock: React.FC<PropsWithChildren<Props>> = ({
  label,
  icon,
  children,
}) => {
  const renderIcon = (): ReactNode => {
    if (!icon) {
      return null;
    }

    if (typeof icon === 'string') {
      return <Icon dangerouslySetInnerHTML={{ __html: icon }} />;
    }

    return <Icon>{icon}</Icon>;
  };

  return (
    <SectionBlockContainer label={label}>
      {renderIcon()}
      {children}
    </SectionBlockContainer>
  );
};
