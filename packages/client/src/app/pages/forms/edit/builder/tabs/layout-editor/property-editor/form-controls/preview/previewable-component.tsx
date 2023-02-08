import type { PropsWithChildren, ReactElement } from 'react';
import { useState } from 'react';
import React from 'react';
import { useSpring } from 'react-spring';
import { useClickOutside } from '@ff-client/hooks/use-click-outside';
import { useOnKeypress } from '@ff-client/hooks/use-on-keypress';
import classes from '@ff-client/utils/classes';

import {
  EditableContentWrapper,
  PreviewContainer,
  PreviewWrapper,
} from './previewable-component.styles';

type Props = {
  preview: ReactElement;
};

export const PreviewableComponent: React.FC<PropsWithChildren<Props>> = ({
  preview,
  children,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const editorRef = useClickOutside<HTMLDivElement>(() => {
    setIsEditing(false);
  }, isEditing);

  useOnKeypress({
    meetsCondition: isEditing,
    callback: (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsEditing(false);
      }
    },
  });

  const editorAnimation = useSpring({
    to: {
      opacity: isEditing ? 1 : 0,
      x: isEditing ? 0 : 20,
      rotate: isEditing ? 0 : 10,
    },
    config: {
      tension: 700,
    },
  });

  return (
    <PreviewWrapper>
      <EditableContentWrapper
        style={editorAnimation}
        className={classes(isEditing && 'active')}
        ref={editorRef}
      >
        {children}
      </EditableContentWrapper>
      <PreviewContainer onClick={() => setIsEditing(true)}>
        {preview}
      </PreviewContainer>
    </PreviewWrapper>
  );
};
