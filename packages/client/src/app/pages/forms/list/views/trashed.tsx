import { useModal } from "@components/modals/modal.context";
import config from "@config/freeform/freeform.config";
import { useSiteContext } from "@ff-client/contexts/site/site.context";
import { QKGroups } from "@ff-client/queries/form-groups";
import { QKForms } from "@ff-client/queries/forms";
import { notifications } from "@ff-client/utils/notifications";
import translate from "@ff-client/utils/translations";
import DeleteIcon from "@ff-icons/actions/delete";
import TrashIcon from "@ff-icons/actions/trash-can";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

import { FormDeleteButton, FormRestoreButton } from "./form-list-actions";
import { FormListDisclosure } from "./form-list-disclosure";
import {
  Item,
  ItemActions,
  ItemDate,
  ItemIdentity,
  ItemMeta,
  ItemTitle,
} from "./grid/archived/archived.item.styles";
import { ArchivedItems } from "./grid/archived/archived.styles";
import { ArchivedAndGroupWrapper } from "./grid/grid.styles";

type TrashedForm = {
  id: number;
  name: string;
  handle: string;
  color: string;
  dateTrashed: string;
  trashedDate: string;
  trashedFromMerge: boolean;
  deleteMessage: {
    before: string;
    submissions: string;
    after: string;
    note: string | null;
    warning: string | null;
  };
};

const TrashedForms = () => {
  const [expanded, setExpanded] = useState(false);
  const { confirmDelete } = useModal();
  const { getCurrentHandleWithFallback } = useSiteContext();
  const site = getCurrentHandleWithFallback();
  const queryClient = useQueryClient();
  const formsKey = QKForms.all(site);
  const {
    data: forms,
    isError,
    refetch,
  } = useQuery({
    queryKey: [...formsKey, "trash"],
    queryFn: ({ signal }) =>
      axios
        .get<TrashedForm[]>("/api/forms/trash", { signal })
        .then(({ data }) => data),
  });
  const change = useMutation({
    mutationFn: (input: { id: number; action: "restore" | "purge" }) =>
      axios.post("/api/forms/trash", {
        trashedForm: input.id,
        trashAction: input.action,
      }),
    onSuccess: async (_, { action }) => {
      notifications.success(
        translate(
          action === "restore"
            ? "The form was restored."
            : "The form was permanently deleted.",
        ),
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: formsKey }),
        queryClient.invalidateQueries({ queryKey: QKGroups.all(site) }),
      ]);
    },
  });

  if (!forms?.length && !isError) return null;

  return (
    <ArchivedAndGroupWrapper>
      <FormListDisclosure
        title={translate("Trashed Forms")}
        label={translate(
          expanded ? "Hide trashed forms" : "Show trashed forms",
        )}
        icon={<TrashIcon />}
        count={forms?.length}
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
      >
        <div className="ff-merge-trash ff-dashboard-trash">
          {isError && (
            <p role="alert">
              {translate("Trashed forms could not be loaded.")}{" "}
              <button
                type="button"
                className="btn"
                onClick={() => void refetch()}
              >
                {translate("Retry")}
              </button>
            </p>
          )}
          {change.isError && (
            <p className="error" role="alert">
              {(axios.isAxiosError(change.error) &&
                change.error.response?.data?.message) ||
                translate("The form could not be updated.")}
            </p>
          )}
          {!!forms?.length && (
            <ArchivedItems>
              {forms.map((form) => (
                <Item key={form.id}>
                  <ItemIdentity>
                    <span className="ff-merge-form-label">
                      <span
                        className="ff-merge-chip-dot"
                        aria-hidden="true"
                        style={
                          /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(form.color)
                            ? { backgroundColor: form.color }
                            : undefined
                        }
                      />
                      <ItemTitle title={form.name}>{form.name}</ItemTitle>
                      {form.trashedFromMerge && (
                        <span className="ff-merge-trash-badge">
                          {translate("Merged")}
                        </span>
                      )}
                    </span>
                    <ItemMeta>
                      <code title={form.handle}>{form.handle}</code>
                    </ItemMeta>
                  </ItemIdentity>
                  <ItemDate>
                    <span>{translate("Trashed")}</span>
                    <time dateTime={form.trashedDate}>{form.dateTrashed}</time>
                  </ItemDate>
                  <ItemActions className="ff-merge-trash-actions ff-dashboard-form-actions">
                    <FormRestoreButton
                      disabled={change.isPending}
                      onClick={() =>
                        change.mutate({ id: form.id, action: "restore" })
                      }
                    >
                      {translate("Restore")}
                    </FormRestoreButton>
                    <FormDeleteButton
                      icon={<DeleteIcon aria-hidden="true" />}
                      title={translate("Delete Permanently")}
                      aria-label={`${translate("Delete Permanently")}: ${form.name}`}
                      aria-haspopup="dialog"
                      disabled={change.isPending}
                      onClick={() =>
                        confirmDelete({
                          title: translate("Permanently delete this form?"),
                          message: (
                            <div className="ff-trash-confirmation-copy">
                              <p>
                                <strong>{form.name}</strong>
                              </p>
                              <p>
                                {form.deleteMessage.before}
                                <strong>
                                  {form.deleteMessage.submissions}
                                </strong>
                                {form.deleteMessage.after}
                                {form.deleteMessage.note && (
                                  <> {form.deleteMessage.note}</>
                                )}
                              </p>
                              {form.deleteMessage.warning && (
                                <p className="ff-trash-confirmation-warning">
                                  <strong>{form.deleteMessage.warning}</strong>
                                </p>
                              )}
                            </div>
                          ),
                          confirmLabel: translate("Delete Permanently"),
                          destructive: true,
                          onConfirm: () =>
                            change.mutate({
                              id: form.id,
                              action: "purge",
                            }),
                        })
                      }
                    >
                      {translate("Delete Permanently")}
                    </FormDeleteButton>
                  </ItemActions>
                </Item>
              ))}
            </ArchivedItems>
          )}
        </div>
      </FormListDisclosure>
    </ArchivedAndGroupWrapper>
  );
};

export const Trash = () =>
  config.metadata.freeform.canDelete ? <TrashedForms /> : null;
