import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@editor/store';
import { contextActions, FocusType } from '@editor/store/slices/context';
import { contextSelectors } from '@editor/store/slices/context/context.selectors';
import { fieldSelectors } from '@editor/store/slices/fields/fields.selectors';
import { useFieldType } from '@ff-client/queries/field-types';
import classes from '@ff-client/utils/classes';
import { hasErrors } from '@ff-client/utils/errors';
import template from 'lodash.template';

import { CellFieldWrapper, Instructions, Label } from './cell-field.styles';

type Props = {
  uid: string;
};

export const CellField: React.FC<Props> = ({ uid }) => {
  const field = useSelector(fieldSelectors.one(uid));
  const type = useFieldType(field?.typeClass);
  const {
    active,
    type: contextType,
    uid: contextUid,
  } = useSelector(contextSelectors.focus);
  const dispatch = useAppDispatch();

  const isActive = useMemo(() => {
    return active && contextType === FocusType.Field && contextUid === uid;
  }, [active, contextType, contextUid, uid]);

  const preview = useMemo(() => {
    if (
      field?.properties === undefined ||
      type?.previewTemplate === undefined
    ) {
      return 'No preview available';
    }

    try {
      const compiled = template(type.previewTemplate);
      return compiled(field.properties);
    } catch (error) {
      return `Preview template error: "${error.message}"`;
    }
  }, [field?.properties, type?.previewTemplate]);

  if (field?.properties === undefined || !type) {
    return null;
  }

  return (
    <CellFieldWrapper
      className={classes(
        hasErrors(field.errors) && 'errors',
        isActive && 'active',
        'field'
      )}
      onClick={(): void => {
        dispatch(contextActions.setFocusedItem({ type: FocusType.Field, uid }));
      }}
    >
      <Label className="label">{field.properties.label || type?.name}</Label>
      {field.properties.instructions && (
        <Instructions>{field.properties.instructions}</Instructions>
      )}
      <div dangerouslySetInnerHTML={{ __html: preview }} />
    </CellFieldWrapper>
  );
};
