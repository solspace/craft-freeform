import React from 'react';
import type { FormWithStats } from '@ff-client/types/forms';
import translate from '@ff-client/utils/translations';

import { ListTableRow } from './list.table.row';
import { Table } from './list.table.styles';

type Props = {
  forms: FormWithStats[];
};

export const ListTable: React.FC<Props> = ({ forms }) => {
  if (!forms) {
    return null;
  }

  return (
    <Table className="table data">
      <thead>
        <tr>
          <th>{translate('Name')}</th>
          <th>{translate('Handle')}</th>
          <th>{translate('Description')}</th>
          <th>{translate('Chart')}</th>
          <th>{translate('Submissions')}</th>
          <th>{translate('Spam')}</th>
          <th>{translate('Manage')}</th>
        </tr>
      </thead>
      <tbody>
        {forms
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((form) => (
            <ListTableRow key={form.id} form={form} />
          ))}
      </tbody>
    </Table>
  );
};
