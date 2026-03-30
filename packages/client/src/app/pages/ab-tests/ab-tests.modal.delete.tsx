import { LoadingText } from "@components/loaders/loading-text/loading-text";
import {
  ModalContainer,
  ModalFooter,
  ModalHeader,
} from "@components/modals/modal.styles";
import type { ModalContainerProps } from "@components/modals/modal.types";
import { notifications } from "@ff-client/utils/notifications";
import translate from "@ff-client/utils/translations";
import type React from "react";

import { useAbTestDeleteMutation } from "./ab-tests.queries";
import { ModalBody } from "./ab-tests.styles";

type ModalData = {
  id: number;
  name: string;
};

export const ABTestDeleteModal: React.FC<ModalContainerProps<ModalData>> = ({
  data,
  closeModal,
}) => {
  const mutation = useAbTestDeleteMutation();

  return (
    <ModalContainer style={{ maxWidth: "560px" }}>
      <ModalHeader>
        <h1>{translate("Delete A/B Test")}</h1>
      </ModalHeader>

      <ModalBody style={{ minHeight: 0 }}>
        <p>
          {translate(
            'Are you sure you want to delete "{name}"? This action cannot be undone.',
            {
              name: data?.name || "",
            },
          )}
        </p>
      </ModalBody>

      <ModalFooter>
        <button type="button" className="btn cancel" onClick={closeModal}>
          {translate("Cancel")}
        </button>
        <button type="button" className="btn submit">
          <LoadingText
            loading={mutation.isPending}
            loadingText={translate("Deleting")}
            spinner
            onClick={() =>
              mutation.mutate(data?.id, {
                onSuccess: () => {
                  notifications.success(
                    translate("A/B Test Group deleted successfully."),
                  );
                  closeModal();
                },
              })
            }
          >
            {translate("Delete")}
          </LoadingText>
        </button>
      </ModalFooter>
    </ModalContainer>
  );
};
