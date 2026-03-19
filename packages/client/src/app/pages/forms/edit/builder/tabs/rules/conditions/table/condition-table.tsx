import type { Condition } from "@ff-client/types/rules";
import { Operator } from "@ff-client/types/rules";
import translate from "@ff-client/utils/translations";
import DeleteIcon from "@ff-icons/actions/delete";
import type React from "react";
import Skeleton from "react-loading-skeleton";
import { v4 } from "uuid";
import { Action, Table } from "./condition-table.styles";
import { FieldSelect } from "./field/field";
import { OperatorSelect } from "./operator/operator";
import { ValueInput } from "./value/value";

type Props = {
  conditions: Condition[];
  buttonLabel?: string;
  loading?: boolean;
  onChange?: (conditions: Condition[]) => void;
};

export const ConditionTable: React.FC<Props> = ({
  conditions,
  buttonLabel,
  loading,
  onChange,
}) => {
  return (
    <Table>
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
                  onChange?.([
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
                  onChange?.([
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
                  onChange?.([
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
                    onChange?.([
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
                type="button"
                className="btn add icon fullwidth"
                onClick={() => {
                  onChange?.([
                    ...conditions,
                    {
                      uid: v4(),
                      field: "",
                      operator: Operator.Equals,
                      value: "",
                    },
                  ]);
                }}
              >
                {translate(buttonLabel || "Add a condition")}
              </button>
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};
