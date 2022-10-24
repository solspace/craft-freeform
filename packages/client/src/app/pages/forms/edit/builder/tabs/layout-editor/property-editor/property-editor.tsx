import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import CloseIcon from '@ff-client/assets/icons/circle-xmark-solid.svg';
import { useOnKeypress } from '@ff-client/hooks/use-on-keypress';

import { selectFocus, unfocus } from '../../../../store/slices/context';
import { useAppDispatch } from '../../../../store/store';

import { ErrorBoundary } from './boundaries/ErrorBoundary';
import { FieldProperties } from './field/field-properties';
import { CloseLink, PropertyEditorWrapper } from './property-editor.styles';

export const PropertyEditor: React.FC = () => {
  const { active, type, uid } = useSelector(selectFocus);
  const dispatch = useAppDispatch();

  const ref = useRef<HTMLDivElement>(null);

  useOnKeypress({
    meetsCondition: active,
    callback: (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        dispatch(unfocus());
      }
    },
  });

  const component = <FieldProperties uid={uid} />;

  return (
    <PropertyEditorWrapper ref={ref}>
      <CloseLink onClick={() => dispatch(unfocus())}>
        <CloseIcon />
      </CloseLink>
      <ErrorBoundary
        message={`Could not load property editor for ${type} type`}
      >
        {component}
      </ErrorBoundary>
    </PropertyEditorWrapper>
  );
};
