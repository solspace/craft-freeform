import React, { useEffect } from 'react';
import { addOption } from '@editor/builder/tabs/layout-editor/property-editor/form-controls/table/table-layout-editor.operations';
import type { Option } from '@editor/builder/tabs/layout-editor/property-editor/form-controls/table/table-layout-editor.types';
import {
  Cell,
  InputPreview,
  Row,
  TabularOptions,
} from '@editor/builder/tabs/layout-editor/property-editor/form-controls/tabular.styles';
import type { Option as PropertyOption } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';

type Props = {
  types: PropertyOption[];
  options: Option[];
  onChange: (value: Option[]) => void;
};

const getTypeLabel = (types: PropertyOption[], value: string): string => {
  const type = types.find((type) => type.value === value);

  return type ? type.label : value;
};

const TableLayoutPreview: React.FC<Props> = ({ types, options, onChange }) => {
  useEffect(() => {
    if (options.length === 0) {
      addOption(options, onChange);
    }
  }, [options]);

  return (
    <TabularOptions>
      {options.map((option, index) => (
        <Row key={index}>
          <Cell>
            <InputPreview
              readOnly
              type="text"
              defaultValue={option.label}
              placeholder={translate('Label')}
            />
          </Cell>
          <Cell>
            <InputPreview
              readOnly
              type="text"
              defaultValue={getTypeLabel(types, option.type)}
              placeholder={translate('Type')}
            />
          </Cell>
          <Cell>
            <InputPreview
              readOnly
              type="text"
              defaultValue={option.value}
              placeholder={translate('Value')}
            />
          </Cell>
        </Row>
      ))}
    </TabularOptions>
  );
};
export default TableLayoutPreview;
