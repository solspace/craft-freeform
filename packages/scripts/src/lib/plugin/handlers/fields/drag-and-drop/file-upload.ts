import type Freeform from "@components/front-end/plugin/freeform";
import events from "@lib/plugin/constants/event-types";
import { ajax } from "@lib/plugin/helpers/ajax";
import { CancelToken } from "@lib/plugin/helpers/ajax/ajax.classes";

import { askForConfirmation } from "./confirm";
import { addFieldErrors } from "./error-handling";
import { createInput, createPreviewContainer } from "./preview";
import type { FieldError, FileMetadata } from "./types";
import { ErrorTypes, isImage } from "./types";

type OnUploadProgressEvent = Event & {
  name: string;
  total: number;
  loaded: number;
  percent: number;
  container: HTMLElement;
};

type OnChangeEvent = Event & {
  name: string;
  freeform: Freeform;
  container: HTMLElement;
};

export const loadExistingUploads = (
  container: HTMLElement,
  freeform: Freeform,
): void => {
  const fileCount = parseInt(container.dataset.fileCount || "0", 10);
  if (fileCount) {
    const previewZone = container.querySelector("[data-preview-zone]");
    const { freeformFileUpload: handle } = container.dataset;

    const formData = new FormData(freeform.form as HTMLFormElement);
    formData.delete("action");
    formData.append("handle", handle);

    const baseUrl = container.getAttribute("data-base-url");

    ajax
      .post<FileMetadata[]>(`${baseUrl}/files`, formData, {
        headers: {
          "Freeform-Preflight": true,
        },
      })
      .then(({ data }) => {
        data.forEach((file) => {
          const previewContainer = createPreviewContainer(file, freeform);

          if (isImage(file.extension)) {
            const thumbnail =
              previewContainer.querySelector<HTMLElement>("[data-thumbnail]");
            thumbnail.setAttribute("data-has-preview", "");
          }

          const deleteFormData = new FormData(freeform.form as HTMLFormElement);
          deleteFormData.delete("action");
          deleteFormData.append("handle", handle);
          deleteFormData.append("id", file.id);

          const removeButton = previewContainer.querySelector<HTMLElement>(
            "[data-remove-button]",
          );
          removeButton.addEventListener("click", () => {
            if (confirm("Are you sure?")) {
              ajax
                .post(`${baseUrl}/files/delete`, deleteFormData)
                .then(() => {
                  previewZone.removeChild(previewContainer);
                  dispatchChange(container, freeform);
                })
                .catch((error) => {
                  alert(error.message);
                });
            }
          });

          previewContainer.appendChild(createInput(handle, file));
          previewContainer.setAttribute("data-completed", "");
          previewZone.appendChild(previewContainer);
        });

        dispatchChange(container, freeform);
      })
      .catch(console.error);
  }
};

export const handleFileUpload = (
  file: File,
  handle: string,
  container: HTMLElement,
  previewZone: Element,
  freeform: Freeform,
): Promise<void> => {
  const token = new CancelToken();
  const handleCancelRequest = () => {
    token.cancel();
  };

  const matches = file.name.match(/.(\w+)$/i);
  const name = file.name;
  const size = formatFileSize(file.size);
  const extension = matches !== null ? matches[1].toLowerCase() : "n/a";

  const previewContainer = createPreviewContainer(
    { name, extension, size },
    freeform,
  );
  const thumbnail =
    previewContainer.querySelector<HTMLElement>("[data-thumbnail]");
  const removeButton = previewContainer.querySelector<HTMLElement>(
    "[data-remove-button]",
  );

  if (isImage(extension)) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      thumbnail.setAttribute("data-has-preview", "");
      thumbnail.style.backgroundImage = `url(${reader.result.toString()})`;
    };
  }

  previewZone.appendChild(previewContainer);
  removeButton.addEventListener("click", handleCancelRequest);
  dispatchChange(container, freeform);

  const formData = new FormData(freeform.form as HTMLFormElement);
  formData.delete("action");
  formData.append("handle", handle);
  formData.append(handle, file);

  const baseUrl = container.getAttribute("data-base-url");

  return ajax
    .post<FileMetadata>(`${baseUrl}/files/upload`, formData, {
      cancelToken: token,
      onUploadProgress: (progress: ProgressEvent) => {
        const { total, loaded } = progress;
        const percent = Math.ceil(loaded / (total / 100));

        freeform._dispatchEvent(
          events.dragAndDrop.onUploadProgress,
          { total, loaded, percent },
          container,
        ) as OnUploadProgressEvent;

        previewContainer.style.setProperty("--progress", `${percent}%`);

        if (percent >= 98) {
          // Prevent files from being removed if they're uploaded already, but still being processed
          removeButton.removeEventListener("click", handleCancelRequest);
        }
      },
    })
    .then((response) => {
      const deleteFormData = new FormData(freeform.form as HTMLFormElement);
      deleteFormData.delete("action");
      deleteFormData.append("handle", handle);
      deleteFormData.append("id", response.data.id);

      removeButton.removeEventListener("click", handleCancelRequest);
      removeButton.addEventListener("click", async () => {
        const isConfirmed = await askForConfirmation(container);
        if (isConfirmed) {
          ajax
            .post(`${baseUrl}/files/delete`, deleteFormData)
            .then(() => {
              previewZone.removeChild(previewContainer);
              dispatchChange(container, freeform);
            })
            .catch((error) => {
              alert(error.message);
            });
        }
      });

      previewContainer.appendChild(createInput(handle, response.data));
      previewContainer.setAttribute("data-completed", "");
    })
    .catch((error) => {
      if (error.message === "Request aborted") {
        previewZone.removeChild(previewContainer);
        dispatchChange(container, freeform);
        return;
      }

      removeButton.removeEventListener("click", handleCancelRequest);
      removeButton.addEventListener("click", () => {
        previewZone.removeChild(previewContainer);
        dispatchChange(container, freeform);
      });

      let messages: string[];
      if (error?.response?.data?.type === ErrorTypes.FieldError) {
        const { messages: errorMessages } = error?.response?.data as FieldError;
        messages = errorMessages;

        addFieldErrors(container, previewContainer, errorMessages, freeform);
      } else {
        console.warn(error);
      }

      freeform._dispatchEvent(
        events.dragAndDrop.afterErrors,
        { container, messages },
        container,
      );
    });
};

const dispatchChange = (container: HTMLElement, freeform: Freeform) => {
  freeform._dispatchEvent(
    events.dragAndDrop.onChange,
    { freeform, container },
    container,
  ) as OnChangeEvent;
};

const formatFileSize = (bytes: number): string => {
  const units = ["B", "KB", "MB", "GB", "TB"];

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const rounded = value.toFixed(1).replace(/\.0$/, "");

  return `${rounded} ${units[unitIndex]}`;
};
