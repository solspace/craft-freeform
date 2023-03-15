import React from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@editor/store';
import { FocusType, setFocusedItem } from '@editor/store/slices/context';
import { selectField } from '@editor/store/slices/fields';
import { useFieldType } from '@ff-client/queries/field-types';
import classes from '@ff-client/utils/classes';
import { hasErrors } from '@ff-client/utils/errors';

import { CellFieldWrapper, Label } from './cell-field.styles';

type Props = {
  uid: string;
};

export const CellField: React.FC<Props> = ({ uid }) => {
  const field = useSelector(selectField(uid));
  const type = useFieldType(field?.typeClass);
  const dispatch = useAppDispatch();

  if (field?.properties === undefined) {
    return null;
  }

  return (
    <CellFieldWrapper
      className={classes(hasErrors(field.errors) && 'errors')}
      onClick={(): void => {
        dispatch(setFocusedItem({ type: FocusType.Field, uid }));
      }}
    >
      <Label>{field.properties.label || type?.name}</Label>
      <div>
        {/* THIS IS TEMPORARY, FOR SOME MORE VARIETY, BEFORE ACTUAL FIELD RENDERING IS IMPLEMENTED */}
        {field.typeClass ===
          'Solspace\\Freeform\\Fields\\Implementations\\TextareaField' && (
          <textarea
            className="nicetext text fullwidth"
            readOnly
            disabled
            rows={field.properties.rows}
          />
        )}

        {field.typeClass !==
          'Solspace\\Freeform\\Fields\\Implementations\\TextareaField' && (
          <input type="text" className="text fullwidth" readOnly disabled />
        )}
      </div>
    </CellFieldWrapper>
  );
};
