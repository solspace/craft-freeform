import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fieldSelectors } from '@editor/store/slices/fields/fields.selectors';
import { useFieldType } from '@ff-client/queries/field-types';
import classes from '@ff-client/utils/classes';

import { CellFieldWrapper, Icon, Label } from './cell-field.styles';

type Props = {
  uid: string;
};

export const CellField: React.FC<Props> = ({ uid }) => {
  const { uid: activeFieldUid } = useParams();

  const field = useSelector(fieldSelectors.one(uid));
  const type = useFieldType(field?.typeClass);
  const navigate = useNavigate();

  if (field?.properties === undefined) {
    return null;
  }

  return (
    <CellFieldWrapper
      onClick={() => navigate(uid)}
      className={classes(activeFieldUid === uid && 'active')}
    >
      <Icon dangerouslySetInnerHTML={{ __html: type?.icon }} />
      <Label>{field.properties.label || type?.name}</Label>
    </CellFieldWrapper>
  );
};
