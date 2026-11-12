import { useAppDispatch } from "@editor/store";
import { removeNotification } from "@editor/store/thunks/notifications";
import type { Notification } from "@ff-client/types/notifications";
import type React from "react";
import { useNavigate } from "react-router-dom";

import DeleteIcon from "./delete";
import { RemoveButtonWrapper } from "./remove.styles";

type Props = {
  notification: Notification;
};

export const Remove: React.FC<Props> = ({ notification }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  return (
    <RemoveButtonWrapper
      type="button"
      onClick={() => {
        dispatch(removeNotification(notification));
        navigate("..");
      }}
    >
      <DeleteIcon />
    </RemoveButtonWrapper>
  );
};
