import React, { useState } from 'react';

import type { ImportOptions } from '../../import.types';
import { Preview } from '../../preview/preview';

import { useExpressFormsDataQuery } from './express-forms.queries';

export const ImportExpressForms: React.FC = () => {
  const [options, setOptions] = useState<ImportOptions>({
    forms: [],
    notifications: [],
    integrations: [],
  });

  const { data } = useExpressFormsDataQuery();

  return (
    <div id="content-container">
      <div id="content" className="content-pane">
        {data && (
          <Preview
            data={data}
            options={options}
            onUpdate={(options) => setOptions(options)}
          />
        )}
      </div>
    </div>
  );
};
