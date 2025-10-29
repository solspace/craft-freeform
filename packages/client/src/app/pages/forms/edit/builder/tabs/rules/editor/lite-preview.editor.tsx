import type { FC } from 'react';
import React from 'react';
import { useSelector } from 'react-redux';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import { fieldSelectors } from '@editor/store/slices/layout/fields/fields.selectors';
import { NoticeItem } from '@ff-client/app/pages/forms/list/notices/notices.styles';
import type { FieldRule } from '@ff-client/types/rules';
import { Combinator, Display, Operator } from '@ff-client/types/rules';
import translate from '@ff-client/utils/translations';

import { CombinatorSelect } from '../conditions/combinator/combinator';
import { DisplaySelect } from '../conditions/display/display';
import { ConditionTable } from '../conditions/table/condition-table';

import { ConfigurationDescription, Label } from './editor.styles';
import { RulesEditorWrapper } from './field.editor.styles';

type Props = {
  label: string;
};

export const LiteEditor: FC<Props> = ({ label }) => {
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
          <span dangerouslySetInnerHTML={{ __html: label }} />
        </LoadingText>
      </Label>

      <div style={{ userSelect: 'none', pointerEvents: 'none', opacity: 0.7 }}>
        <ConfigurationDescription>
          <DisplaySelect value={rule.display} />

          {translate('this field when')}

          <CombinatorSelect value={rule.combinator} />

          {translate('of the following rules match:')}
        </ConfigurationDescription>

        <ConditionTable
          conditions={rule.conditions}
          buttonLabel="Upgrade to Pro to add rules"
        />
      </div>

      <NoticeItem data-type="new" style={{ marginTop: '2rem' }}>
        <div
          dangerouslySetInnerHTML={{
            __html: translate(
              '<a href="{link}" target="_blank">Upgrade to Pro</a> to enable advanced rules for this field',
              {
                link: 'https://craft-5.ddev.site/admin/plugin-store/freeform',
              }
            ),
          }}
        />
      </NoticeItem>
    </RulesEditorWrapper>
  );
};
