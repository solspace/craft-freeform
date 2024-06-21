import 'microtip/microtip.css';

import type Freeform from '@components/front-end/plugin/freeform';
import events from '@lib/plugin/constants/event-types';
import { dispatchCustomEvent } from '@lib/plugin/helpers/event-handling';
import type { FreeformHandler } from 'types/form';

import { handleFileUpload, loadExistingUploads } from './file-upload';
import { showError } from './messaging';
import type { ChangeEvent } from './types';

class DragAndDropFile implements FreeformHandler {
  freeform;

  private currentFileUploads = 0;
  private isFormLocked = false;

  constructor(freeform: Freeform) {
    this.freeform = freeform;
    this.reload();
  }

  reload = (): void => {
    const form = this.freeform.form;
    const fileUploads = this.freeform.form.querySelectorAll<HTMLElement>('[data-freeform-file-upload]');
    fileUploads.forEach((fileUpload) => {
      fileUpload.style.setProperty('--accent', fileUpload.dataset.accent);

      fileUpload.addEventListener('dragenter', this.handleDrag(fileUpload));
      fileUpload.addEventListener('dragleave', this.handleDragLeave(fileUpload));
      fileUpload.addEventListener('dragover', this.handleDrag(fileUpload));
      fileUpload.addEventListener('drop', this.handleDrop(fileUpload));
      fileUpload.addEventListener('click', this.handleClick(fileUpload));
      fileUpload.addEventListener(events.dragAndDrop.onChange, this.handleChanges);

      loadExistingUploads(fileUpload, this.freeform);
      form.addEventListener(events.form.reset, this.handleReset(fileUpload));

      fileUpload
        .querySelector<HTMLInputElement>(`input[type=file]`)
        .addEventListener('change', this.handleManualUpload(fileUpload));
    });
  };

  handleChanges = ({ container }: ChangeEvent): void => {
    const previewZone = container.querySelector('[data-preview-zone]');
    const uploadedFileCount = previewZone.querySelectorAll('[data-file-preview]').length;
    if (uploadedFileCount > 0) {
      container.setAttribute('data-contains-files', '');
    } else {
      container.removeAttribute('data-contains-files');
    }
  };

  attachDragState = (target: EventTarget): void => {
    if (target instanceof HTMLElement) {
      target.dataset.dragging = '';
    }
  };

  detachDragState = (target: EventTarget): void => {
    if (target instanceof HTMLElement) {
      delete target.dataset.dragging;
    }
  };

  handleDrag = (container: HTMLElement): EventListenerOrEventListenerObject => {
    return (event: DragEvent): void => {
      event.preventDefault();
      event.stopPropagation();

      this.attachDragState(container);
    };
  };

  handleDragLeave = (container: HTMLElement): EventListenerOrEventListenerObject => {
    return (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      this.detachDragState(container);
    };
  };

  handleDrop = (container: HTMLElement): EventListenerOrEventListenerObject => {
    return (event: DragEvent): void => {
      event.preventDefault();
      event.stopPropagation();

      this.detachDragState(container);

      const dataTransfer = event.dataTransfer;
      const files = dataTransfer.files;

      this.initFileUpload(files, container);
    };
  };

  handleClick = (container: HTMLElement): EventListenerOrEventListenerObject => {
    return (): void => {
      const input = container.querySelector<HTMLInputElement>('input[type="file"]');
      if (!input) {
        throw new Error('File upload corrupted');
      }

      input.click();
    };
  };

  handleManualUpload = (container: HTMLElement): EventListenerOrEventListenerObject => {
    return (event: Event): void => {
      const input = event.target as HTMLInputElement;
      const { files } = input;

      this.initFileUpload(files, container);
      input.value = null;
    };
  };

  initFileUpload = (files: FileList, container: HTMLElement): void => {
    const { freeformFileUpload: handle, maxFiles, maxSize } = container.dataset;
    const { messageSize, messageFiles } = container.dataset;
    const previewZone = container.querySelector('[data-preview-zone]');

    let fileCount = container.querySelectorAll('[data-file-preview]:not([data-has-errors])').length;

    for (let i = 0; i < files.length; i++) {
      if (fileCount >= parseInt(maxFiles)) {
        showError(container, messageFiles);
        break;
      }

      const file = files.item(i);
      if (file.size > parseInt(maxSize)) {
        showError(container, messageSize);
        continue;
      }

      this.currentFileUploads++;

      handleFileUpload(file, handle, container, previewZone, this.freeform).finally(() => {
        this.currentFileUploads--;
        this.handleUploadLockdown();
      });

      fileCount++;
      this.handleUploadLockdown();
    }
  };

  handleReset = (container: HTMLElement): EventListenerOrEventListenerObject => {
    return (): void => {
      const items = container.querySelectorAll('[data-file-preview]');
      items.forEach((item) => item.parentNode.removeChild(item));
      dispatchCustomEvent(events.dragAndDrop.onChange, { container }, container);
    };
  };

  handleUploadLockdown = (): void => {
    if (this.currentFileUploads > 0) {
      if (!this.isFormLocked) {
        this.isFormLocked = true;
        this.freeform.lockSubmit('file-upload');
      }
    } else {
      this.freeform.unlockSubmit('file-upload');
      this.isFormLocked = false;
    }
  };
}

export default DragAndDropFile;
