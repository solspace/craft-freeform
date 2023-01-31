import React from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@editor/store';
import { selectFocus, unfocus } from '@editor/store/slices/context';
import { selectField } from '@editor/store/slices/fields';
import CloseIcon from '@ff-client/assets/icons/circle-xmark-solid.svg';
import { useOnKeypress } from '@ff-client/hooks/use-on-keypress';

import { ErrorBoundary } from './boundaries/ErrorBoundary';
import { FavoriteButton } from './favorite/favorite.button';
import { FieldProperties } from './field/field-properties';
import { CloseLink, PropertyEditorWrapper } from './property-editor.styles';

export const PropertyEditor: React.FC = () => {
  const { active, type, uid } = useSelector(selectFocus);
  const field = useSelector(selectField(uid));

  const dispatch = useAppDispatch();

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
    <PropertyEditorWrapper>
      <CloseLink onClick={() => dispatch(unfocus())}>
        <CloseIcon />
      </CloseLink>
      <FavoriteButton field={field} />
      <ErrorBoundary
        message={`Could not load property editor for "${type}" type`}
      >
        {component}
      </ErrorBoundary>
    </PropertyEditorWrapper>
  );
};
