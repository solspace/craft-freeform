import React from 'react';
import { Control } from '@components/form-controls/control';
import { FlexColumn } from '@components/layout/blocks/flex';
import { spacings } from '@ff-client/styles/variables';
import translate from '@ff-client/utils/translations';

import type { TableEditorProps } from './table.editor.types';

export const TableTextEditor: React.FC<TableEditorProps> = ({
  column,
  onUpdate,
}) => {
  return (
    <FlexColumn $gap={spacings.lg}>
      <Control label={translate('Default value')} handle="value">
        {column.type === 'textarea' ? (
          <textarea
            className="text fullwidth"
            rows={4}
            value={column.value}
            onChange={(event) =>
              onUpdate({ ...column, value: event.target.value })
            }
          />
        ) : (
          <input
            type="text"
            className="text fullwidth"
            value={column.value}
            onChange={(event) =>
              onUpdate({ ...column, value: event.target.value })
            }
          />
        )}
      </Control>

      <Control label={translate('Placeholder')} handle="placeholder">
        <input
          type="text"
          className="text fullwidth"
          value={column.placeholder || ''}
          onChange={(event) =>
            onUpdate({ ...column, placeholder: event.target.value })
          }
        />
      </Control>
    </FlexColumn>
  );
};
