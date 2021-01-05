import React from 'react';
import { TYPE_CHECKBOX, TYPE_SELECT, TYPE_STRING } from '../../PropertyEditor/PropertyItems/Table/Column';
import HtmlInput from './HtmlInput';

export default class Table extends HtmlInput {
  getClassName() {
    return 'Table';
  }

  showIcon() {
    return false;
  }

  renderTable() {
    const {
      properties: { tableLayout },
    } = this.props;

    if (!tableLayout || !tableLayout.length) {
      return (
        <table className={`shadow-box editable fullwidth`}>
          <thead>
            <tr>
              <th>Empty Table</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>---</td>
            </tr>
          </tbody>
        </table>
      );
    }

    return (
      <table className={`shadow-box editable fullwidth`}>
        <thead>
          <tr>
            {tableLayout.map(({ label }, i) => (
              <th key={`${i}th`}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {tableLayout.map(({ value, type }, i) => {
              let input, tdClass;
              switch (type) {
                case TYPE_CHECKBOX:
                  input = <input type="checkbox" value={value} readOnly />;

                  break;

                case TYPE_SELECT:
                  let options = [];
                  if (value) {
                    options = value.split(';');
                  }

                  tdClass = 'thin';
                  input = (
                    <div className="select small">
                      <select>
                        {options.map((item, j) => (
                          <option key={j} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                  break;

                case TYPE_STRING:
                default:
                  tdClass = 'textual';
                  input = <textarea rows={1} readOnly value={value ? value : ''} />;
                  break;
              }

              return (
                <td key={i} className={tdClass}>
                  {input}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    );
  }

  renderInput = () => <div className="table">{this.renderTable()}</div>;
}
