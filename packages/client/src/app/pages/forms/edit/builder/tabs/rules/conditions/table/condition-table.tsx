import React from 'react';
import Skeleton from 'react-loading-skeleton';
import type { Condition } from '@ff-client/types/rules';
import { Operator } from '@ff-client/types/rules';
import translate from '@ff-client/utils/translations';
import DeleteIcon from '@ff-icons/actions/delete.svg';
import { v4 } from 'uuid';

import { FieldSelect } from './field/field';
import { OperatorSelect } from './operator/operator';
import { ValueInput } from './value/value';
import { Action, Table } from './condition-table.styles';

type Props = {
  conditions: Condition[];
  loading?: boolean;
  onChange?: (conditions: Condition[]) => void;
};

export const ConditionTable: React.FC<Props> = ({
  conditions,
  loading,
  onChange,
}) => {
  return (
    <Table>
      <thead>
        <tr>
          <th>{translate('Field')}</th>
          <th>{translate('Condition')}</th>
          <th>{translate('Value')}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {loading && (
          <tr>
            <td>
              <Skeleton height={34} />
            </td>
            <td>
              <Skeleton height={34} />
            </td>
            <td>
              <Skeleton height={34} />
            </td>
            <td></td>
          </tr>
        )}
        {conditions.map((condition, index) => (
          <tr key={index}>
            <td>
              <FieldSelect
                condition={condition}
                onChange={(fieldUid) =>
                  onChange &&
                  onChange([
                    ...conditions.slice(0, index),
                    { ...condition, field: fieldUid },
                    ...conditions.slice(index + 1),
                  ])
                }
              />
            </td>
            <td>
              <OperatorSelect
                condition={condition}
                onChange={(operator) =>
                  onChange &&
                  onChange([
                    ...conditions.slice(0, index),
                    { ...condition, operator },
                    ...conditions.slice(index + 1),
                  ])
                }
              />
            </td>
            <td>
              <ValueInput
                condition={condition}
                onChange={(value) => {
                  onChange &&
                    onChange([
                      ...conditions.slice(0, index),
                      { ...condition, value },
                      ...conditions.slice(index + 1),
                    ]);
                }}
              />
            </td>
            <td>
              <Action>
                <DeleteIcon
                  onClick={() => {
                    onChange &&
                      onChange([
                        ...conditions.slice(0, index),
                        ...conditions.slice(index + 1),
                      ]);
                  }}
                />
              </Action>
            </td>
          </tr>
        ))}

        {!loading && (
          <tr>
            <td colSpan={4}>
              <button
                className="btn add icon dashed fullwidth"
                onClick={() => {
                  onChange &&
                    onChange([
                      ...conditions,
                      {
                        uid: v4(),
                        field: '',
                        operator: Operator.Equals,
                        value: '',
                      },
                    ]);
                }}
              >
                {translate('Add condition')}
              </button>
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};
