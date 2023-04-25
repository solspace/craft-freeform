import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fieldSelectors } from '@editor/store/slices/fields/fields.selectors';
import { fieldRuleSelectors } from '@editor/store/slices/rules/fields/field-rules.selectors';
import { useFieldType } from '@ff-client/queries/field-types';
import { operatorShorthand, operatorTypes } from '@ff-client/types/rules';
import classes from '@ff-client/utils/classes';

import { CombinatorIcon } from './icons/combinator-icon';
import { DisplayIcon } from './icons/display-icon';
import {
  CellFieldWrapper,
  FieldInfo,
  Icon,
  Label,
  Small,
} from './cell-field.styles';

type Props = {
  uid: string;
};

export const CellField: React.FC<Props> = ({ uid }) => {
  const { uid: activeFieldUid } = useParams();
  const navigate = useNavigate();

  const field = useSelector(fieldSelectors.one(uid));
  const type = useFieldType(field?.typeClass);

  const currentField = activeFieldUid === uid;
  const activeRule = useSelector(fieldRuleSelectors.one(activeFieldUid));
  const hasRule = useSelector(fieldRuleSelectors.hasRule(uid));

  const condition = activeRule?.conditions.find(
    (condition) => condition.field === uid
  );

  if (field?.properties === undefined) {
    return null;
  }

  return (
    <CellFieldWrapper
      onClick={() => navigate(activeFieldUid === uid ? '' : `field/${uid}`)}
      className={classes(
        currentField && 'active',
        hasRule && 'has-rule',
        condition && 'is-in-condition',
        operatorTypes.negative.includes(condition?.operator) && 'not-equals'
      )}
    >
      <FieldInfo>
        <Icon dangerouslySetInnerHTML={{ __html: type?.icon }} />
        <Label>{field.properties.label || type?.name}</Label>

        {currentField && <DisplayIcon display={activeRule?.display} />}
        {currentField && <CombinatorIcon combinator={activeRule?.combinator} />}
      </FieldInfo>
      {condition && (
        <Small>
          {operatorShorthand[condition.operator]} {condition.value}
        </Small>
      )}
    </CellFieldWrapper>
  );
};
