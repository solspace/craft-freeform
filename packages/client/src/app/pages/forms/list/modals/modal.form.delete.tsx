import { LoadingText } from "@components/loaders/loading-text/loading-text";
import {
  ModalContainer,
  ModalFooter,
  ModalHeader,
} from "@components/modals/modal.styles";
import type { ModalContainerProps } from "@components/modals/modal.types";
import { useSiteContext } from "@ff-client/contexts/site/site.context";
import { useOnKeypress } from "@ff-client/hooks/use-on-keypress";
import { QKGroups } from "@ff-client/queries/form-groups";
import { QKForms } from "@ff-client/queries/forms";
import classes from "@ff-client/utils/classes";
import translate from "@ff-client/utils/translations";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import DOMPurify from "dompurify";
import type React from "react";
import type { ChangeEvent } from "react";
import { useId, useState } from "react";

import { FormWrapper } from "./modal.form.styles";

export const DeleteFormModal: React.FC<ModalContainerProps> = ({
  data,
  closeModal,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const inputId = useId();
  // Translate separately so the confirmation stays a single, simple word.
  const confirmationWord = translate("delete");
  const enabled =
    inputValue.normalize("NFC").toUpperCase() ===
    confirmationWord.normalize("NFC").toUpperCase();

  const queryClient = useQueryClient();
  const { getCurrentHandleWithFallback } = useSiteContext();

  useOnKeypress(
    {
      callback: (event: KeyboardEvent): void => {
        switch (event.key) {
          case "Enter":
            handleDelete();
            return;
        }
      },
    },
    [enabled, isDeleting],
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setInputValue(event.target.value);
  };

  const handleDelete = async (): Promise<void> => {
    if (!enabled || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      await axios.post(`/api/forms/delete`, { id: data?.form.id });
      await queryClient.invalidateQueries({
        queryKey: QKGroups.all(getCurrentHandleWithFallback()),
      });
      await queryClient.invalidateQueries({
        queryKey: QKForms.all(getCurrentHandleWithFallback()),
      });

      setInputValue("");

      closeModal();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ModalContainer>
      <ModalHeader>
        <h1>{data?.form.name}</h1>
      </ModalHeader>

      <FormWrapper>
        <div>
          {translate(
            "Are you sure you want to permanently delete this form? This action cannot be undone.",
          )}
        </div>
        <label
          htmlFor={inputId}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(
              translate(
                "To delete this form, type <strong>{word}</strong> below (case-insensitive):",
                { word: confirmationWord.toUpperCase() },
              ),
            ),
          }}
        />
        <input
          id={inputId}
          type="text"
          autoFocus={true}
          value={inputValue}
          autoComplete="off"
          spellCheck={false}
          onChange={handleChange}
          className="text fullwidth"
        />
      </FormWrapper>

      <ModalFooter>
        <button type="button" className="btn cancel" onClick={closeModal}>
          {translate("Cancel")}
        </button>
        <button
          type="button"
          className={classes(
            "btn submit",
            (!enabled || isDeleting) && "disabled",
          )}
          disabled={!enabled || isDeleting}
          onClick={handleDelete}
        >
          <LoadingText
            loadingText={translate("Deleting")}
            loading={isDeleting}
            spinner
          >
            {translate("Delete")}
          </LoadingText>
        </button>
      </ModalFooter>
    </ModalContainer>
  );
};
