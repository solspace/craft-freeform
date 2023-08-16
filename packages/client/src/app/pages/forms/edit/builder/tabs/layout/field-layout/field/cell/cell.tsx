import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import { useAppDispatch } from '@editor/store';
import { contextActions, FocusType } from '@editor/store/slices/context';
import { contextSelectors } from '@editor/store/slices/context/context.selectors';
import type { Field } from '@editor/store/slices/layout/fields';
import { useFieldType } from '@ff-client/queries/field-types';
import { Type } from '@ff-client/types/fields';
import classes from '@ff-client/utils/classes';
import { hasErrors } from '@ff-client/utils/errors';

import { GroupFieldLayout } from '../../layout/group-field-layout/group-field-layout';

import { FieldCellWrapper, Instructions, Label } from './cell.styles';
import { useFieldPreview } from './use-field-preview';

type Props = {
  field: Field;
};

export const FieldCell: React.FC<Props> = ({ field }) => {
  const dispatch = useAppDispatch();
  const type = useFieldType(field?.typeClass);
  const { uid } = field;

  const {
    active,
    type: contextType,
    uid: contextUid,
  } = useSelector(contextSelectors.focus);

  const isActive = useMemo(() => {
    return active && contextType === FocusType.Field && contextUid === uid;
  }, [active, contextType, contextUid, uid]);

  const [preview, isLoadingPreview] = useFieldPreview(field, type);

  if (field?.properties === undefined || !type) {
    return null;
  }

  return (
    <FieldCellWrapper
      className={classes(
        hasErrors(field.errors) && 'errors',
        type.type === Type.Group && 'group',
        isActive && 'active',
        'field'
      )}
      onClick={(event): void => {
        event.stopPropagation();
        dispatch(contextActions.setFocusedItem({ type: FocusType.Field, uid }));
      }}
    >
      <Label className="label">
        <LoadingText loading={isLoadingPreview} spinner>
          {field.properties.label || type?.name}
        </LoadingText>
      </Label>
      {field.properties.instructions && (
        <Instructions>{field.properties.instructions}</Instructions>
      )}
      {type.type === Type.Group && (
        <GroupFieldLayout field={field} layoutUid={field.properties?.layout} />
      )}
      {type.type !== Type.Group && (
        <div dangerouslySetInnerHTML={{ __html: preview }} />
      )}
    </FieldCellWrapper>
  );
};
