import 'microtip/microtip.css';

import type Freeform from '@components/front-end/plugin/freeform';
import { EVENT_DND_ON_CHANGE } from '@lib/plugin/constants/event-types';

import { handleFileUpload, loadExistingUploads } from './file-upload';
import type { ChangeEvent, UploadProgress } from './types';

class DragAndDropFile {
  freeform;
  currentUploads: WeakMap<HTMLElement, UploadProgress> = new WeakMap();

  constructor(freeform: Freeform) {
    this.freeform = freeform;
    this.reload();
  }

  reload = (): void => {
    const fileUploads = this.freeform.form.querySelectorAll<HTMLElement>('[data-freeform-file-upload]');
    fileUploads.forEach((fileUpload) => {
      fileUpload.addEventListener('dragenter', this.handleDrag(fileUpload));
      fileUpload.addEventListener('dragleave', this.handleDragLeave(fileUpload));
      fileUpload.addEventListener('dragover', this.handleDrag(fileUpload));
      fileUpload.addEventListener('drop', this.handleDrop(fileUpload));
      fileUpload.addEventListener(EVENT_DND_ON_CHANGE, this.handleChanges);

      loadExistingUploads(fileUpload, this.freeform);
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

      const handle = container.dataset.freeformFileUpload;

      const dataTransfer = event.dataTransfer;
      const files = dataTransfer.files;

      const previewZone = container.querySelector('[data-preview-zone]');

      for (let i = 0; i < files.length; i++) {
        const file = files.item(i);
        handleFileUpload(file, handle, container, previewZone, this.freeform);
      }
    };
  };
}

export default DragAndDropFile;
