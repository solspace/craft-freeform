import config from "@config/freeform/freeform.config";
import { useDeleteFormModal } from "@ff-client/app/pages/forms/list/modals/hooks/use-delete-form-modal";
import { useSiteContext } from "@ff-client/contexts/site/site.context";
import { QKGroups } from "@ff-client/queries/form-groups";
import { QKForms } from "@ff-client/queries/forms";
import type { FormWithStats } from "@ff-client/types/forms";
import classes from "@ff-client/utils/classes";
import translate from "@ff-client/utils/translations";
import TrashIcon from "@ff-icons/actions/trash-can";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { isValid, parseISO } from "date-fns";
import type React from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { useArchiveFormMutation } from "../grid.mutations";

import {
  DeleteButton,
  Item,
  ItemActions,
  ItemDate,
  ItemIdentity,
  ItemMeta,
  ItemTitle,
  ItemTitleLink,
} from "./archived.item.styles";

type Props = {
  form: FormWithStats;
};

export const ArchivedItem: React.FC<Props> = ({ form }) => {
  const navigate = useNavigate();
  const { getCurrentHandleWithFallback } = useSiteContext();
  const queryClient = useQueryClient();

  const { id, name, handle, links, dateArchived } = form;

  const archiveMutation = useArchiveFormMutation();
  const isDisabled =
    (archiveMutation.isPending || archiveMutation.isSuccess) &&
    archiveMutation.context === id;

  const { canDelete } = config.metadata.freeform;
  const openDeleteFormModal = useDeleteFormModal({ form });

  const onNavigate = (): void => {
    queryClient.invalidateQueries({ queryKey: QKForms.single(Number(id)) });
    navigate(`${id}`);
  };

  const hasTitleLink = links.filter(({ type }) => type === "title").length;
  const linkList = form.links.filter(({ type }) => type === "linkList");

  const archivedAt = dateArchived ? parseISO(dateArchived) : null;
  const locale = config.metadata.craft.locale?.replaceAll("_", "-");
  const archivedDate =
    archivedAt && isValid(archivedAt)
      ? new Intl.DateTimeFormat(locale || undefined, {
          dateStyle: "medium",
        }).format(archivedAt)
      : null;

  return (
    <Item className={classes(isDisabled && "disabled")} aria-busy={isDisabled}>
      <ItemIdentity>
        {hasTitleLink ? (
          <ItemTitleLink type="button" title={name} onClick={onNavigate}>
            {name}
          </ItemTitleLink>
        ) : (
          <ItemTitle title={name}>{name}</ItemTitle>
        )}
        <ItemMeta>
          <code title={handle}>{handle}</code>
          {linkList
            .filter(({ count }) => count)
            .map((link) =>
              !link.url ? (
                <span key={link.handle}>{link.label}</span>
              ) : link.internal ? (
                <NavLink key={link.handle} to={link.url}>
                  {link.label}
                </NavLink>
              ) : (
                <a key={link.handle} href={link.url}>
                  {link.label}
                </a>
              ),
            )}
        </ItemMeta>
      </ItemIdentity>
      {archivedDate && archivedAt && (
        <ItemDate>
          <span>{translate("Archived")}</span>
          <time dateTime={archivedAt.toISOString()}>{archivedDate}</time>
        </ItemDate>
      )}
      <ItemActions>
        <button
          type="button"
          className="btn small"
          disabled={isDisabled}
          aria-label={`${translate("Restore this Form")}: ${name}`}
          onClick={() => {
            archiveMutation.mutate(id);
          }}
        >
          {translate(isDisabled ? "Restoring" : "Restore")}
        </button>
        {canDelete && (
          <DeleteButton
            type="button"
            disabled={isDisabled}
            title={translate("Delete this Form and its Submissions")}
            aria-label={`${translate("Delete this Form and its Submissions")}: ${name}`}
            onClick={async (event) => {
              if (event.metaKey && event.shiftKey) {
                await axios.post(`/api/forms/delete`, { id });
                queryClient.invalidateQueries({
                  queryKey: QKGroups.all(getCurrentHandleWithFallback()),
                });
                queryClient.invalidateQueries({
                  queryKey: QKForms.all(getCurrentHandleWithFallback()),
                });
              } else {
                openDeleteFormModal();
              }
            }}
          >
            <TrashIcon />
          </DeleteButton>
        )}
      </ItemActions>
    </Item>
  );
};
