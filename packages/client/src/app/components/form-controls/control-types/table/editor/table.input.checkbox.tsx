import React, { useId } from 'react';
import { Checkbox } from '@components/elements/checkbox/checkbox';
import { FlexColumn, FlexRow } from '@components/layout/blocks/flex';
import { spacings } from '@ff-client/styles/variables';
import translate from '@ff-client/utils/translations';

import type { TableEditorProps } from './table.editor.types';

export const TableCheckboxEditor: React.FC<TableEditorProps> = ({
  column,
  onUpdate,
}) => {
  const id = useId();
  const isChecked = column.checked ?? false;

  return (
    <FlexColumn $gap={spacings.lg}>
      <FlexRow $alignItems="center">
        <Checkbox
          id={id}
          checked={isChecked}
          onChange={() => onUpdate({ ...column, checked: !column.checked })}
        />
        <label htmlFor={id}>
          {translate(isChecked ? 'checked by default' : 'unchecked by default')}
        </label>
      </FlexRow>
    </FlexColumn>
  );
};
