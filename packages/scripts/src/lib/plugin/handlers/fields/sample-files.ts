import type Freeform from "@components/front-end/plugin/freeform";
import events from "@lib/plugin/constants/event-types";
import type { FreeformHandler } from "types/form";
import { formatFileSize } from "./drag-and-drop/file-upload";
import { createPreviewContainer } from "./drag-and-drop/preview";

type SampleFile = {
  kind: string;
  name: string;
  mime: string;
  data: string;
  size: number;
};
type Descriptor = SampleFile & {
  key: string;
  token: string;
  label: string;
  removeLabel: string;
  count?: number;
  additionalFiles?: SampleFile[];
};
type SampleState = {
  element: HTMLElement;
  input: HTMLInputElement;
  descriptor: Descriptor;
  required: boolean;
  removed: boolean;
  generated?: File;
  marker?: HTMLInputElement;
  previews: HTMLElement[];
};
const states = new WeakMap<HTMLElement, SampleState>();
const selector = "[data-freeform-sample-file]";

export const clearSampleFile = (
  element: HTMLElement,
  clearInput = false,
): void => {
  const state = states.get(element);
  if (!state) return;
  if (clearInput && state.generated) state.input.value = "";
  state.marker?.remove();
  state.previews.forEach((preview) => {
    preview.remove();
  });
  state.previews = [];
  state.generated = undefined;
  state.removed = true;
  state.input.required = state.required;
};

export default class SampleFilesHandler implements FreeformHandler {
  private resetPending = false;

  constructor(private freeform: Freeform) {
    const form = freeform.form;
    form.addEventListener("formdata", (event: FormDataEvent) => {
      form.querySelectorAll<HTMLElement>(selector).forEach((element) => {
        const state = states.get(element);
        if (!state || state.removed) return;
        const { input, marker, generated } = state;
        if (input.matches(":disabled")) {
          if (marker) event.formData.delete(marker.name);
          return;
        }
        if (!generated || !input.name) return;
        // Only remove our own in-memory fixture. Real user files remain untouched.
        const values = event.formData.getAll(input.name);
        event.formData.delete(input.name);
        values.forEach((value) => {
          if (
            !(value instanceof File) ||
            value.name !== generated.name ||
            value.size !== generated.size ||
            value.lastModified !== generated.lastModified
          )
            event.formData.append(input.name, value);
        });
      });
    });
    const reset = (event: Event) => {
      if (this.resetPending) return;
      this.resetPending = true;
      queueMicrotask(() => {
        this.resetPending = false;
        if (event.defaultPrevented) return;
        form.querySelectorAll<HTMLElement>(selector).forEach((element) => {
          const state = states.get(element);
          if (state) {
            clearSampleFile(element, true);
            state.removed = false;
            this.populate(state);
          }
        });
      });
    };
    form.addEventListener("reset", reset);
    form.addEventListener(events.form.reset, reset);
    this.reload();
  }

  reload = (): void => {
    this.freeform.form
      .querySelectorAll<HTMLElement>(selector)
      .forEach((element) => {
        if (states.has(element)) return;
        const input =
          element instanceof HTMLInputElement
            ? element
            : element.querySelector<HTMLInputElement>('input[type="file"]');
        if (!input || input.files?.length || input.matches(":disabled")) return;
        let descriptor: Descriptor;
        try {
          descriptor = JSON.parse(element.dataset.freeformSampleFile);
        } catch {
          return;
        }
        if (!descriptor?.key || !descriptor.token || !descriptor.data) return;
        const state: SampleState = {
          element,
          input,
          descriptor,
          required: input.required,
          removed: false,
          previews: [],
        };
        states.set(element, state);
        if (element instanceof HTMLInputElement) {
          input.addEventListener("change", () => clearSampleFile(element));
        }
        this.populate(state);
      });
  };

  private populate(state: SampleState): void {
    const { element, input, descriptor } = state;
    const marker = document.createElement("input");
    marker.type = "hidden";
    marker.name = `__freeform_sample_files[${descriptor.key}]`;
    marker.value = descriptor.token;
    state.marker = marker;
    const url = `data:${descriptor.mime};base64,${descriptor.data}`;

    if (element instanceof HTMLInputElement) {
      try {
        const transfer = new DataTransfer();
        const bytes = Uint8Array.from(atob(descriptor.data), (char) =>
          char.charCodeAt(0),
        );
        const file = new File([bytes], descriptor.name, {
          type: descriptor.mime,
        });
        transfer.items.add(file);
        input.files = transfer.files;
        state.generated = file;
      } catch {
        // The signed marker provides the same test-only behavior on older browsers.
        input.required = false;
      }
      const preview = document.createElement("span");
      preview.style.cssText =
        "display:flex;align-items:center;gap:8px;margin-top:8px;font-size:.875em;";
      preview.setAttribute("data-freeform-sample-preview", "");
      if (descriptor.kind === "image") {
        const image = document.createElement("img");
        image.src = url;
        image.alt = "";
        image.style.cssText =
          "width:64px;height:40px;object-fit:contain;border-radius:4px;";
        preview.append(image);
      }
      const label = document.createElement("span");
      label.textContent = `${descriptor.label}: ${descriptor.name}`;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "×";
      remove.setAttribute("aria-label", descriptor.removeLabel);
      remove.addEventListener("click", () => clearSampleFile(element, true));
      preview.append(label, remove, marker);
      const labelAfterInput = input.nextElementSibling;
      const anchor =
        labelAfterInput instanceof HTMLLabelElement &&
        labelAfterInput.htmlFor === input.id
          ? labelAfterInput
          : input;
      anchor.insertAdjacentElement("afterend", preview);
      state.previews = [preview];
    } else {
      const zone = element.querySelector<HTMLElement>("[data-preview-zone]");
      if (!zone || zone.querySelector("[data-file-preview]")) return;
      const count = Math.max(
        1,
        Math.min(
          3,
          descriptor.count ?? 1,
          Number(element.dataset.maxFiles) || 1,
        ),
      );
      const files = descriptor.additionalFiles
        ? [descriptor, ...descriptor.additionalFiles]
        : Array.from({ length: count }, (_, index) => ({
            ...descriptor,
            name: index
              ? descriptor.name.replace(/(\.[^.]+)$/, `-${index + 1}$1`)
              : descriptor.name,
          }));
      for (const file of files.slice(0, count)) {
        const preview = createPreviewContainer(
          {
            name: file.name,
            extension: file.name.split(".").pop(),
            size: formatFileSize(file.size),
            url:
              file.kind === "image"
                ? `data:${file.mime};base64,${file.data}`
                : undefined,
          },
          this.freeform,
        );
        preview.setAttribute("data-freeform-sample-preview", "");
        preview.setAttribute("data-completed", "");
        preview.title = descriptor.label;
        if (file.kind === "image")
          preview
            .querySelector("[data-thumbnail]")
            ?.setAttribute("data-has-preview", "");
        preview
          .querySelector("[data-remove-button]")
          ?.addEventListener("click", () => {
            preview.remove();
            state.previews = state.previews.filter((item) => item !== preview);
            if (!state.previews.length) clearSampleFile(element);
            this.freeform._dispatchEvent(
              events.dragAndDrop.onChange,
              { container: element },
              element,
            );
          });
        zone.append(preview);
        state.previews.push(preview);
      }
      zone.append(marker);
      this.freeform._dispatchEvent(
        events.dragAndDrop.onChange,
        { container: element },
        element,
      );
    }
  }
}
