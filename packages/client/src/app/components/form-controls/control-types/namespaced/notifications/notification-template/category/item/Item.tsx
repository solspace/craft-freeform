import { useModal } from "@components/modals/modal.context";
import { ConfirmSubmissionsModal } from "@editor/builder/tabs/modals/confirm-submissions.modal";
import { QKNotifications } from "@ff-client/queries/notifications";
import type { APIError } from "@ff-client/types/api";
import type { NotificationTemplate } from "@ff-client/types/notifications";
import classes from "@ff-client/utils/classes";
import { notifications } from "@ff-client/utils/notifications";
import translate from "@ff-client/utils/translations";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type React from "react";
import { useNotificationEditModal } from "../../modal/template.modal.hooks";
import type { NotificationSelectHandler } from "../../notification-template";
import { Button, ButtonGroup, Name, TemplateCard } from "./item.styles";

type Props = {
  active: boolean;
  canEditGlobalTemplates?: boolean;
  canEditGlobalFileTemplates?: boolean;
  openEditOnClick?: boolean;
  template: NotificationTemplate;
  onClick: NotificationSelectHandler;
};

export const Item: React.FC<Props> = ({
  active,
  canEditGlobalTemplates,
  canEditGlobalFileTemplates,
  openEditOnClick,
  template,
  onClick,
}) => {
  const { id, name } = template;
  const isDbTemplate = /^\d+$/.test(template.id.toString());
  const canEditGlobalTemplate = isDbTemplate
    ? canEditGlobalTemplates
    : canEditGlobalFileTemplates;

  const { openModal: openModalFn } = useModal();
  const queryClient = useQueryClient();
  const openModal = useNotificationEditModal();

  return (
    <TemplateCard
      className={classes(active ? "active" : "")}
      onClick={() => {
        if (openEditOnClick) {
          openModal({ id });
        } else {
          onClick(template);
        }
      }}
    >
      <Name title={name}>{name}</Name>

      {!template.formId && canEditGlobalTemplate && (
        <ButtonGroup>
          <Button
            title={translate("Edit")}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              const target = isDbTemplate ? "database" : "files";

              const url = Craft.getCpUrl(
                `freeform/notifications/${target}/${template.id}`,
              );

              // if control or command pressed, open in new tab
              if (e.metaKey) {
                window.open(url, "_blank")?.focus();
              } else {
                openModalFn(ConfirmSubmissionsModal, { url });
              }
            }}
          >
            <i className="fa-solid fa-pencil"></i>
          </Button>
        </ButtonGroup>
      )}

      {!!template.formId && (
        <ButtonGroup>
          <Button
            title={translate("Edit")}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              openModal({ id });

              return false;
            }}
          >
            <i className="fa-solid fa-pencil"></i>
          </Button>
          <Button
            title={translate("Delete")}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              if (
                confirm(
                  translate("Are you sure you want to delete this template?"),
                )
              ) {
                axios
                  .post("/api/templates/notifications/delete", {
                    id,
                  })
                  .then(() => {
                    queryClient.invalidateQueries({
                      queryKey: QKNotifications.templates(),
                    });
                    queryClient.invalidateQueries({
                      queryKey: QKNotifications.formTemplates(template.formId),
                    });
                  })
                  .catch((error: APIError) => {
                    const errors = Object.values(error.errors).join(", ");
                    notifications.error(errors);
                  });
              }

              return false;
            }}
          >
            <i className="fa-solid fa-xmark" />
          </Button>
        </ButtonGroup>
      )}
    </TemplateCard>
  );
};
