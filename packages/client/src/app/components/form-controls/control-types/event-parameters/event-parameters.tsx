import { Control } from "@components/form-controls/control";
import type { ControlType } from "@components/form-controls/types";
import { fieldSelectors } from "@editor/store/slices/layout/fields/fields.selectors";
import { useFetchFieldTypes } from "@ff-client/queries/field-types";
import type { EventParametersProperty } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import type React from "react";
import { useSelector } from "react-redux";

import { AddRow, Editor } from "./event-parameters.styles";

const EventParameters: React.FC<ControlType<EventParametersProperty>> = ({
  value,
  property,
  errors,
  updateValue,
}) => {
  const rows = value ?? [];
  const fields = useSelector(fieldSelectors.all);
  const { data: fieldTypes, isPending } = useFetchFieldTypes();
  const options = fields.filter((field) => {
    const type = fieldTypes?.find((type) => type.typeClass === field.typeClass);
    return type && property.availableFieldTypes.includes(type.type);
  });
  const update = (index: number, column: number, next: string) => {
    updateValue(
      rows.map<[string, string]>((row, current) =>
        current === index
          ? column === 0
            ? [next, row[1]]
            : [row[0], next]
          : row,
      ),
    );
  };

  return (
    <Control property={property} errors={errors}>
      <Editor>
        {rows.length > 0 && (
          <table className="editable fullwidth">
            <colgroup>
              <col style={{ width: "45%" }} />
              <col />
              <col style={{ width: 44 }} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">{translate("Parameter name")}</th>
                <th scope="col">{translate("Form field")}</th>
                <th scope="col" aria-label={translate("Actions")} />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td className="textual">
                    <input
                      className="text fullwidth code"
                      type="text"
                      autoComplete="off"
                      data-1p-ignore
                      aria-label={translate("Parameter name {number}", {
                        number: index + 1,
                      })}
                      placeholder="insurance_type"
                      maxLength={40}
                      value={row[0]}
                      onChange={(event) => update(index, 0, event.target.value)}
                    />
                  </td>
                  <td>
                    <div className="select fullwidth">
                      <select
                        aria-label={translate("Form field {number}", {
                          number: index + 1,
                        })}
                        value={row[1]}
                        disabled={isPending}
                        onChange={(event) =>
                          update(index, 1, event.target.value)
                        }
                      >
                        <option value="">
                          {translate(
                            isPending ? "Loading fields…" : "Select a field",
                          )}
                        </option>
                        {row[1] &&
                          !options.some((field) => field.uid === row[1]) && (
                            <option value={row[1]} disabled>
                              {translate(
                                isPending
                                  ? "Loading fields…"
                                  : "Mapped field no longer exists or is unsupported",
                              )}
                            </option>
                          )}
                        {options.map((field) => (
                          <option key={field.uid} value={field.uid}>
                            {field.properties.label} ({field.properties.handle})
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="action">
                    <button
                      className="delete icon"
                      type="button"
                      title={translate("Remove parameter")}
                      aria-label={translate("Remove parameter {number}", {
                        number: index + 1,
                      })}
                      onClick={() =>
                        updateValue(
                          rows.filter((_, current) => current !== index),
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <AddRow
          $empty={!rows.length}
          label="Add parameter"
          disabled={rows.length >= 24}
          onClick={() => updateValue([...rows, ["", ""]])}
        />
      </Editor>
    </Control>
  );
};

export default EventParameters;
