import { ActionMenu } from "@components/action-menu/action-menu";
import translate from "@ff-client/utils/translations";
import EditIcon from "@ff-icons/actions/pencil";
import TrashIcon from "@ff-icons/actions/trash-can";
import type React from "react";

type Props = {
  onDelete: () => void;
  onEdit: () => void;
};

export const ABTestActions: React.FC<Props> = ({ onDelete, onEdit }) => (
  <ActionMenu
    choices={[
      {
        icon: <EditIcon />,
        label: translate("Edit"),
        onClick: onEdit,
      },
      {
        destructive: true,
        icon: <TrashIcon />,
        label: translate("Delete"),
        onClick: onDelete,
      },
    ]}
  />
);
