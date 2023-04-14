import type { PropsWithChildren, ReactElement } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';
import { useState } from 'react';
import React from 'react';
import { PopUpPortal } from '@components/elements/pop-up-portal';
import { useClickOutside } from '@ff-client/hooks/use-click-outside';
import { useOnKeypress } from '@ff-client/hooks/use-on-keypress';
import classes from '@ff-client/utils/classes';

import { useEditorAnimations } from './previewable-component.animations';
import {
  EditableContentWrapper,
  PreviewContainer,
  PreviewWrapper,
} from './previewable-component.styles';

type Props = {
  preview: ReactElement;
  onEdit?: () => void;
  onAfterEdit?: () => void;
};

export const PreviewableComponent: React.FC<PropsWithChildren<Props>> = ({
  preview,
  onEdit,
  onAfterEdit,
  children,
}) => {
  const [isEditing, setIsEditing] = useState(undefined);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const { editorAnimation } = useEditorAnimations({
    wrapper: wrapperRef.current,
    editor: editorRef.current,
    isEditing,
  });

  useClickOutside<HTMLDivElement>(
    () => {
      setIsEditing(false);
    },
    isEditing,
    editorRef
  );

  useOnKeypress({
    meetsCondition: isEditing,
    callback: (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsEditing(false);
      }
    },
  });

  // Call after-edit callbacks when the editor is being closed
  useEffect(() => {
    if (isEditing === false) {
      onAfterEdit && onAfterEdit();
    }
  }, [isEditing]);

  return (
    <PreviewWrapper ref={wrapperRef}>
      <PopUpPortal>
        <EditableContentWrapper
          style={{
            pointerEvents: isEditing ? 'initial' : 'none',
            ...editorAnimation,
          }}
          className={classes(isEditing && 'active')}
          ref={editorRef}
        >
          {children}
        </EditableContentWrapper>
      </PopUpPortal>

      <PreviewContainer
        onClick={() => {
          setIsEditing(true);
          onEdit && onEdit();
        }}
      >
        {preview}
      </PreviewContainer>
    </PreviewWrapper>
  );
};
