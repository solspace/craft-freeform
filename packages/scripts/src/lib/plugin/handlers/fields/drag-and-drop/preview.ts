import type Freeform from '@components/front-end/plugin/freeform';
import events from '@lib/plugin/constants/event-types';
import { addDnDClass, removeDnDClass } from '@lib/plugin/helpers/classes';
import { truncate } from '@lib/plugin/helpers/strings';

import { createErrorContainer } from './error-handling';
import type { FileMetadata } from './types';

type PreviewRemoveButtonRenderEvent = Event & { button: HTMLElement };
type PreviewRenderEvent = Event & {
  metadata: FileMetadata;
  container: HTMLElement;
};

const createContainer = ({
  name,
  extension,
  size,
}: FileMetadata): [HTMLElement, HTMLElement, HTMLElement, HTMLElement] => {
  const container = document.createElement('div');
  container.setAttribute('data-file-preview', '');
  addDnDClass(container, 'preview-zone', 'file-preview');

  const extensionLabel = document.createElement('span');
  extensionLabel.setAttribute('data-extension-label', '');
  extensionLabel.innerText = extension.toUpperCase();
  addDnDClass(extensionLabel, 'preview-zone', 'file-preview', 'thumbnail', 'extension-label');

  const thumbnail = document.createElement('div');
  thumbnail.setAttribute('data-thumbnail', '');
  thumbnail.appendChild(extensionLabel);
  addDnDClass(thumbnail, 'preview-zone', 'file-preview', 'thumbnail');

  const filename = document.createElement('span');
  filename.setAttribute('data-filename', '');
  filename.innerText = truncate(name, 14);
  filename.title = name;
  addDnDClass(filename, 'preview-zone', 'file-preview', 'filename');

  const filesize = document.createElement('span');
  filesize.setAttribute('data-filesize', '');
  filesize.innerText = size;
  addDnDClass(filesize, 'preview-zone', 'file-preview', 'filesize');

  container.appendChild(thumbnail);
  container.appendChild(filename);
  container.appendChild(filesize);

  return [container, thumbnail, filename, filesize];
};

export const createRemoveButton = (freeform: Freeform): HTMLElement => {
  const button = document.createElement('a');
  button.setAttribute('data-remove-button', '');
  button.innerHTML = `<svg style="height: 14px; width: 14px;" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="times" class="svg-inline--fa fa-times fa-w-11" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512"><path fill="currentColor" d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path></svg>`;
  addDnDClass(button, 'preview-zone', 'file-preview', 'thumbnail', 'remove-button');

  const event = freeform._dispatchEvent(events.dragAndDrop.renderPreviewRemoveButton, {
    button,
  }) as PreviewRemoveButtonRenderEvent;

  return event.button;
};

export const createProgressContainer = (): HTMLElement => {
  const progress = document.createElement('div');
  progress.setAttribute('data-progress', '');
  addDnDClass(progress, 'preview-zone', 'file-preview', 'thumbnail', 'progress');

  return progress;
};

type CreatePreviewContainer = (metadata: FileMetadata, freeform: Freeform) => HTMLElement;

export const createPreviewContainer: CreatePreviewContainer = (metadata, freeform) => {
  const [container, thumbnail] = createContainer(metadata);

  if (metadata.url) {
    thumbnail.style.backgroundImage = `url(${metadata.url})`;
  }

  const removeButton = createRemoveButton(freeform);
  const errorContainer = createErrorContainer(freeform);
  const progress = createProgressContainer();

  thumbnail.appendChild(removeButton);
  thumbnail.appendChild(errorContainer);
  thumbnail.appendChild(progress);

  const event = freeform._dispatchEvent(events.dragAndDrop.renderPreview, {
    metadata,
    container,
  }) as PreviewRenderEvent;

  addDnDClass(container, 'preview-zone', 'file-preview', 'animation-enter');
  setTimeout(() => {
    removeDnDClass(container, 'preview-zone', 'file-preview', 'animation-enter');
  }, 10);

  // Prevent click-through for the preview container
  // so that the click-to-upload doesn't get triggered
  event.container.addEventListener('click', (event) => event.stopPropagation());

  return event.container;
};

export const createInput = (handle: string, { id }: FileMetadata): HTMLInputElement => {
  const uploadedFileInput = document.createElement('input');
  uploadedFileInput.type = 'hidden';
  uploadedFileInput.value = id;
  uploadedFileInput.name = `${handle}[]`;

  return uploadedFileInput;
};
