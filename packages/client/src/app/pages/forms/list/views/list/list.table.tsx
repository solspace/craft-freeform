import React from 'react';
import config from '@config/freeform/freeform.config';
import type { FormWithStats } from '@ff-client/types/forms';
import translate from '@ff-client/utils/translations';

import { AiButton, EnableAiLink } from '../../list-view.styles';
import { useCreateFormModal } from '../../modals/hooks/use-create-form-modal';
import { useCreateWithAiFormModal } from '../../modals/hooks/use-create-with-ai-form-modal';
import { useAiIntegrations } from '../../modals/modal.form.create-with-ai.queries';

import { ListTableRow } from './list.table.row';
import { ListTableRowLoading } from './list.table.row.loading';
import { Table, TableScrollWrapper } from './list.table.styles';

type Props = {
  forms: FormWithStats[] | undefined;
  isFetching?: boolean;
};

export const ListTable: React.FC<Props> = ({ forms, isFetching }) => {
  const openCreateFormModal = useCreateFormModal();
  const openCreateWithAiFormModal = useCreateWithAiFormModal();
  const { data: aiIntegrations } = useAiIntegrations();
  const { canCreate } = config.metadata.freeform;
  const canViewIntegrations = config.permissions.integrations !== 'none';
  const showAiButtons = canViewIntegrations;
  const showEnableAi =
    showAiButtons && aiIntegrations && aiIntegrations.length === 0;

  const hasFormMonitor = forms?.some((form) => form.formMonitor?.enabled);

  return (
    <TableScrollWrapper>
      <Table className="table data">
        <thead>
          <tr>
            <th>{translate('Name')}</th>
            <th>{translate('Handle')}</th>
            <th>{translate('Description')}</th>
            <th>{translate('Chart')}</th>
            {hasFormMonitor && <th>{translate('Monitoring')}</th>}
            {hasFormMonitor && <th>{translate('Last Test')}</th>}
            <th>{translate('Submissions')}</th>
            <th>{translate('Spam')}</th>
            <th>{translate('Manage')}</th>
          </tr>
        </thead>
        <tbody>
          {isFetching && forms === undefined && (
            <>
              <ListTableRowLoading />
              <ListTableRowLoading />
              <ListTableRowLoading />
              <ListTableRowLoading />
            </>
          )}

          {!isFetching && !forms?.length && canCreate && (
            <tr>
              <td colSpan={hasFormMonitor ? 9 : 7}>
                <p>
                  {translate(
                    `You don't have any forms yet. Create your first form now...`
                  )}
                </p>

                {showAiButtons &&
                  (showEnableAi ? (
                    <EnableAiLink
                      to="/integrations/ai/SolspaceAIV1"
                      className="btn add icon"
                      data-icon="sparkles"
                    >
                      {translate('Enable AI')}
                    </EnableAiLink>
                  ) : (
                    <AiButton
                      type="button"
                      className="btn add icon"
                      data-icon="sparkles"
                      onClick={openCreateWithAiFormModal}
                    >
                      {translate('Create with AI')}
                    </AiButton>
                  ))}
                <button
                  type="button"
                  className="btn submit add icon"
                  onClick={openCreateFormModal}
                >
                  {translate('Create a new Form')}
                </button>
              </td>
            </tr>
          )}

          {!isFetching && !forms?.length && !canCreate && (
            <tr>
              <td colSpan={hasFormMonitor ? 9 : 7}>
                <p>{translate(`You don't have any forms yet.`)}</p>
              </td>
            </tr>
          )}

          {forms
            ?.sort((a, b) => a.name.localeCompare(b.name))
            ?.map((form) => (
              <ListTableRow
                key={form.id}
                form={form}
                hasFormMonitor={hasFormMonitor}
              />
            ))}
        </tbody>
      </Table>
    </TableScrollWrapper>
  );
};
