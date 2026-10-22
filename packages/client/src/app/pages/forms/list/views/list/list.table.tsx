import config from "@config/freeform/freeform.config";
import type { FormWithStats } from "@ff-client/types/forms";
import translate from "@ff-client/utils/translations";
import type React from "react";
import { useAddFormModal } from "../../modals/hooks/use-add-form-modal";

import { ListTableRow } from "./list.table.row";
import { ListTableRowLoading } from "./list.table.row.loading";
import { Table, TableScrollWrapper } from "./list.table.styles";

type Props = {
  forms: FormWithStats[] | undefined;
  isFetching?: boolean;
  isSearching?: boolean;
};

export const ListTable: React.FC<Props> = ({
  forms,
  isFetching,
  isSearching = false,
}) => {
  const openAddForm = useAddFormModal();
  const { canCreate } = config.metadata.freeform;

  const showIcons = config.metadata.craft.is5;
  const hasFormMonitor = forms?.some((form) => form.formMonitor?.enabled);

  const columnCount = 7 + (hasFormMonitor ? 2 : 0) + (showIcons ? 1 : 0);

  return (
    <TableScrollWrapper>
      <Table className="table data">
        <thead>
          <tr>
            {showIcons && (
              <th
                scope="col"
                className="form-icon-column"
                aria-label={translate("Form Icon")}
              />
            )}
            <th>{translate("Name")}</th>
            <th>{translate("Handle")}</th>
            <th>{translate("Description")}</th>
            <th>{translate("Chart")}</th>
            {hasFormMonitor && <th>{translate("Monitoring")}</th>}
            {hasFormMonitor && <th>{translate("Last Test")}</th>}
            <th>{translate("Submissions")}</th>
            <th>{translate("Spam")}</th>
            <th>{translate("Manage")}</th>
          </tr>
        </thead>
        <tbody>
          {isFetching && forms === undefined && (
            <>
              <ListTableRowLoading showIcons={showIcons} />
              <ListTableRowLoading showIcons={showIcons} />
              <ListTableRowLoading showIcons={showIcons} />
              <ListTableRowLoading showIcons={showIcons} />
            </>
          )}

          {!isFetching && !forms?.length && isSearching && (
            <tr>
              <td colSpan={columnCount}>
                <p role="status">{translate("No forms match your search.")}</p>
              </td>
            </tr>
          )}

          {!isFetching && !forms?.length && !isSearching && canCreate && (
            <tr>
              <td colSpan={columnCount}>
                <p>
                  {translate(
                    `You don't have any forms yet. Create your first form now...`,
                  )}
                </p>

                <button
                  type="button"
                  className="btn submit add icon"
                  onClick={openAddForm}
                >
                  {translate("Add new form")}
                </button>
              </td>
            </tr>
          )}

          {!isFetching && !forms?.length && !isSearching && !canCreate && (
            <tr>
              <td colSpan={columnCount}>
                <p>{translate(`You don't have any forms yet.`)}</p>
              </td>
            </tr>
          )}

          {forms
            ?.slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            ?.map((form) => (
              <ListTableRow
                key={form.id}
                form={form}
                showIcons={showIcons}
                hasFormMonitor={hasFormMonitor}
              />
            ))}
        </tbody>
      </Table>
    </TableScrollWrapper>
  );
};
