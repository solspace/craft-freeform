import type Freeform from '../freeform';
import { attachAttributes, getAttributeManifest, preserveAttributes } from './errors.attributes';
import { callbackOnInputs } from './errors.operations';
import type { CategorizedAttributes } from './errors.types';

export function renderSuccess(): void {
  const self = this as Freeform;

  const { form, options } = self;
  const { successBannerMessage, successClassBanner } = options;

  const attributesManifest = getAttributeManifest(form);
  const attributes = attributesManifest.form.success;
  const tag = attributes?.tag || 'div';
  if (attributes.tag) {
    delete attributes.tag;
  }

  attributes['data-ff-form-banner'] = 'success';
  if (successClassBanner) {
    attributes.class = `${attributes?.class || ''} ${successClassBanner}`.trim();
  }

  const successMessage = document.createElement(tag);
  attachAttributes(successMessage, attributes);

  const paragraph = document.createElement('p');
  paragraph.appendChild(document.createTextNode(successBannerMessage));

  successMessage.appendChild(paragraph);

  form.insertBefore(successMessage, form.childNodes[0]);
}

/**
 * Render success/error banners
 *
 * @param errors
 */
export function renderErrors(errors: string[]): void {
  const self = this as Freeform;

  const { form, options } = self;
  const { errorClassBanner, errorBannerMessage } = options;

  const attributesManifest = getAttributeManifest(form);
  const attributes = attributesManifest.form.error;

  const tag = attributes?.tag || 'div';
  if (attributes.tag) {
    delete attributes.tag;
  }

  attributes['data-ff-form-banner'] = 'error';
  if (errorClassBanner) {
    attributes.class = `${attributes?.class || ''} ${errorClassBanner}`.trim();
  }

  const errorBlock = document.createElement(tag);
  attachAttributes(errorBlock, attributes);

  const paragraph = document.createElement('p');
  paragraph.appendChild(document.createTextNode(errorBannerMessage));
  errorBlock.appendChild(paragraph);

  if (errors.length) {
    const errorsList = document.createElement('ul');
    errors.forEach((message) => {
      const listItem = document.createElement('li');

      listItem.appendChild(document.createTextNode(message));
      errorsList.appendChild(listItem);
    });

    errorBlock.appendChild(errorsList);
  }

  form.insertBefore(errorBlock, form.childNodes[0]);
}

/**
 * Render field-specific error messages
 *
 * @param errors
 */
export function renderFieldErrors(errors: Record<string, string[]>): void {
  const self = this as Freeform;
  const attributeManifest = getAttributeManifest(self.form);

  Object.entries(errors).forEach(([handle, messages]) => {
    const container = self.form.querySelector<HTMLDivElement>(`[data-field-container="${handle}"]`);
    const attributes = attributeManifest.fields?.[handle];

    renderFieldError(self, handle, container, attributes, messages);
  });
}

const renderFieldError = (
  freeform: Freeform,
  handle: string,
  container: HTMLElement,
  attributes: CategorizedAttributes,
  messages: string[]
): void => {
  if (!attributes) {
    return;
  }

  const form = freeform.form;
  const fieldErrorClass = freeform.options.errorClassField;
  if (fieldErrorClass) {
    if (!attributes.input?.class?.includes(fieldErrorClass)) {
      attributes.input.class = `${attributes.input?.class || ''} ${fieldErrorClass}`.trim();
    }
  }

  const label = container?.querySelector<HTMLLabelElement>('[data-field-label]');
  const instructions = container?.querySelector<HTMLElement>('[data-field-instructions]');

  preserveAttributes(container, label, instructions);
  attachAttributes(container, attributes.container);
  attachAttributes(label, attributes.label);
  attachAttributes(instructions, attributes.instructions);

  container.dataset.ffHasErrors = 'true';

  callbackOnInputs(container, (element) => {
    preserveAttributes(element);
    attachAttributes(element, attributes.input);
  });

  const errorsList = document.createElement('ul');
  attachAttributes(errorsList, attributes.error);
  messages.forEach((message) => {
    const listItem = document.createElement('li');
    listItem.appendChild(document.createTextNode(message));
    errorsList.appendChild(listItem);
  });

  const errorAppendTarget = form.querySelector<HTMLElement>(`[data-error-append-target="${handle}"]`);
  if (errorAppendTarget) {
    errorAppendTarget.appendChild(errorsList);
  } else {
    container.appendChild(errorsList);
  }
};
