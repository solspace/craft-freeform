import type { FC } from 'react';
import React from 'react';
import { useSelector } from 'react-redux';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import { fieldSelectors } from '@editor/store/slices/layout/fields/fields.selectors';
import { colors, spacings } from '@ff-client/styles/variables';
import type { FieldRule } from '@ff-client/types/rules';
import { Combinator, Display, Operator } from '@ff-client/types/rules';
import translate from '@ff-client/utils/translations';
import DOMPurify from 'dompurify';
import styled from 'styled-components';

import { CombinatorSelect } from '../conditions/combinator/combinator';
import { DisplaySelect } from '../conditions/display/display';
import { ConditionTable } from '../conditions/table/condition-table';

import { ConfigurationDescription, Label } from './editor.styles';
import { RulesEditorWrapper } from './field.editor.styles';

type Props = {
  label: string;
};

export const UpsellEditor: FC<Props> = ({ label }) => {
  const fields = useSelector(fieldSelectors.all);

  const firstField = fields.length > 0 ? fields[0].uid : '';
  const secondField = fields.length > 1 ? fields[1].uid : '';

  const rule: FieldRule = {
    combinator: Combinator.Or,
    conditions: [
      {
        field: firstField,
        operator: Operator.Contains,
        value: 'John Doe',
        uid: 'test-1',
      },
      {
        field: secondField,
        operator: Operator.EndsWith,
        value: '@gmail.com',
        uid: 'test-2',
      },
    ],
    display: Display.Show,
    enabled: true,
    field: '',
    uid: 'rule-1',
  };

  return (
    <RulesEditorWrapper>
      <Label>
        <LoadingText>
          <span
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(label) }}
          />
        </LoadingText>
      </Label>

      <PreviewWrapper>
        <UpsellBanner
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(
              translate(
                '<a href="{link}" target="_blank">Upgrade to Freeform Pro</a> to create conditional rules.',
                { link: Craft.getCpUrl('plugin-store/freeform') }
              )
            ),
          }}
        />

        <LockedContent>
          <ConfigurationDescription>
            <DisplaySelect value={rule.display} />

            {translate('this field when')}

            <CombinatorSelect value={rule.combinator} />

            {translate('of the following rules match:')}
          </ConfigurationDescription>

          <ConditionTable
            conditions={rule.conditions}
            buttonLabel="Upgrade to Freeform Pro to create conditional rules."
          />
        </LockedContent>
      </PreviewWrapper>
    </RulesEditorWrapper>
  );
};

const PreviewWrapper = styled.div`
  position: relative;
`;

const LockedContent = styled.div`
  user-select: none;
  pointer-events: none;
  filter: blur(1.3px);
`;

const UpsellBanner = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;

  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1;
  transform: translate(-50%, -50%);

  padding: ${spacings.md} ${spacings.xl};

  border: 2px solid ${colors.blue400};
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 6px rgba(31, 41, 51, 0.2);

  font-size: 14px;
  text-align: center;
  color: ${colors.gray700};

  a {
    color: ${colors.blue500};
    font-weight: bold;
    text-decoration: underline;
  }

  a:hover {
    color: ${colors.blue600};
  }
`;
