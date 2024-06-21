import React, { useRef, useState } from 'react';
import Bool from '@components/form-controls/control-types/bool/bool';
import Select from '@components/form-controls/control-types/select/select';
import Textarea from '@components/form-controls/control-types/textarea/textarea';
import { useOnKeypress } from '@ff-client/hooks/use-on-keypress';
import { PropertyType } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';

import { BulkEditorWrapper } from './custom.bulk.styles';

type Props = {
  open?: boolean;
  close?: () => void;
  bulkImport: (values: string, separator: string, append: boolean) => void;
};

export const Bulk: React.FC<Props> = ({ open, close, bulkImport }) => {
  const [separator, setSeparator] = useState('|');
  const [append, setAppend] = useState(true);
  const [bulk, setBulk] = useState('');

  const textarea = useRef<HTMLTextAreaElement>(null);

  const executeBulkImport = (): void => {
    bulkImport(bulk, separator, append);
    setBulk('');
    close();
  };

  useOnKeypress(
    {
      callback: (event) => {
        if (event.key === 'Enter' && event.metaKey) {
          executeBulkImport();
        }
      },
      meetsCondition: open,
      type: 'keydown',
      ref: textarea,
    },
    [bulk, separator, append]
  );

  return (
    <BulkEditorWrapper className="bulk-editor">
      <Select
        value={separator}
        updateValue={(value) => setSeparator(value)}
        property={{
          label: translate('Separator'),
          instructions: translate(
            'Select the separator used to separate the label and value'
          ),
          handle: 'separator',
          type: PropertyType.Select,
          value: '|',
          options: [
            { value: '|', label: 'Pipe' },
            { value: ',', label: 'Comma' },
            { value: ';', label: 'Semicolon' },
            { value: '=>', label: 'Arrow' },
            { value: ' ', label: 'Space' },
          ],
        }}
      />

      <Bool
        updateValue={(value) => setAppend(value)}
        value={append}
        property={{
          label: translate('Append values'),
          handle: 'append',
          type: PropertyType.Boolean,
        }}
      />

      <Textarea
        value={bulk}
        updateValue={(value) => setBulk(value)}
        focus={open}
        ref={textarea}
        property={{
          label: translate('Bulk editor'),
          instructions: translate(
            'Enter bulk values separated by new lines. You can provide a label and a value separated by a separator. For example, if you used `{separator}` you would write: `Label{separator}Value`. You can also just provide a label.',
            { separator }
          ),
          handle: 'bulkEditor',
          type: PropertyType.Textarea,
          rows: 10,
        }}
      />
      <button className="btn" onClick={executeBulkImport}>
        {translate(append ? 'Append bulk import' : 'Replace with bulk import')}
      </button>
    </BulkEditorWrapper>
  );
};
