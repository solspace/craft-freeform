import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import config from '@config/freeform/freeform.config';
import type { Field as FieldTypeProp } from '@editor/store/slices/layout/fields';
import { buttonRuleSelectors } from '@editor/store/slices/rules/buttons/buttons.selectors';
import { fieldRuleSelectors } from '@editor/store/slices/rules/fields/field-rules.selectors';
import { pageRuleSelectors } from '@editor/store/slices/rules/pages/page-rules.selectors';
import { submitFormRuleSelectors } from '@editor/store/slices/rules/submit-form/submit-form.selectors';
import { useFieldType } from '@ff-client/queries/field-types';
import type { PageButtonType } from '@ff-client/types/rules';
import { operatorTypes } from '@ff-client/types/rules';
import classes from '@ff-client/utils/classes';

import { Layout } from '../layout/layout';

import {
  FieldInfo,
  FieldWrapper,
  GroupWrapper,
  Icon,
  Label,
} from './field.styles';

type Props = {
  field: FieldTypeProp;
};

export const Field: React.FC<Props> = ({ field }) => {
  const canEdit = config.limitations.can('rules.tab.fields');
  const { uid: activeFieldUid, button: activeButton } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const type = useFieldType(field?.typeClass);
  const currentField = activeFieldUid === field.uid;

  const activeRule = useSelector(fieldRuleSelectors.one(activeFieldUid));
  const activePageRule = useSelector(pageRuleSelectors.one(activeFieldUid));
  const submitFormRule = useSelector(submitFormRuleSelectors.one);
  const buttonRule = useSelector(
    buttonRuleSelectors.one(activeFieldUid, activeButton as PageButtonType)
  );

  const hasRule = useSelector(fieldRuleSelectors.hasRule(field.uid));

  const isSubmitFormRuleOpen = location.pathname.endsWith('/rules/submit');
  const isInCondition = useSelector(
    fieldRuleSelectors.isInCondition(field.uid)
  );

  const isInActiveCondition =
    activeRule?.conditions.find((condition) => condition.field === field.uid) ||
    activePageRule?.conditions.find(
      (condition) => condition.field === field.uid
    ) ||
    (isSubmitFormRuleOpen &&
      submitFormRule?.conditions.find(
        (condition) => condition.field === field.uid
      )) ||
    (activeButton &&
      buttonRule?.conditions.find(
        (condition) => condition.field === field.uid
      ));

  if (field?.properties === undefined) {
    return null;
  }

  return (
    <FieldWrapper
      onClick={(event) => {
        event.stopPropagation();
        if (canEdit) {
          navigate(activeFieldUid === field.uid ? '' : `field/${field.uid}`);
        }
      }}
      className={classes(
        type?.type === 'group' && 'group',
        currentField && 'active',
        hasRule && 'has-rule',
        isInCondition && 'is-in-condition',
        isInActiveCondition && 'is-in-condition-active',
        !canEdit && 'read-only',
        operatorTypes.negative.includes(isInActiveCondition?.operator) &&
          'not-equals'
      )}
    >
      <FieldInfo>
        <Icon dangerouslySetInnerHTML={{ __html: type?.icon }} />
        <Label>{field.properties.label || type?.name}</Label>
      </FieldInfo>

      {type?.type === 'group' && (
        <GroupWrapper>
          <Layout layoutUid={field.properties.layout} />
        </GroupWrapper>
      )}
    </FieldWrapper>
  );
};
